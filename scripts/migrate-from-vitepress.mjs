// 把旧 VitePress 博客（docs/ 目录）的 Markdown 迁移成 Firefly 文章
// 用法: node scripts/migrate-from-vitepress.mjs <旧仓库根目录> <docs 下的相对路径...>
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CATEGORY_BY_DIR = [
	["basic/algorithm", "算法"],
	["basic/network", "计算机网络"],
	["frontend", "前端基础"],
	["framework", "框架"],
	["archive", "工具与环境"],
	["essay", "随笔"],
	["share", "分享"],
	["input", "输入"],
];

const TAG_BY_SEGMENT = {
	v8: "V8",
	security: "浏览器安全",
	Browser: "浏览器",
	react: "React",
	vue: "Vue",
	tree: "二叉树",
	"linked-list": "链表",
	stack: "栈",
	queue: "队列",
	TCPIP: "TCP/IP",
	HTTP: "HTTP",
};

const [oldRepo, ...files] = process.argv.slice(2);
if (!oldRepo || files.length === 0) {
	console.error("用法: node scripts/migrate-from-vitepress.mjs <旧仓库根目录> <docs 下的相对路径...>");
	process.exit(1);
}

const outRoot = path.resolve("src/content/posts");

for (const rel of files) {
	const src = path.join(oldRepo, "docs", rel);
	let body = fs.readFileSync(src, "utf8");

	const oldMeta = {};
	const fm = body.match(/^---\n([\s\S]*?)\n---\n/);
	if (fm) {
		for (const line of fm[1].split("\n")) {
			const m = line.match(/^(\w+):\s*(.*)$/);
			if (m) oldMeta[m[1]] = m[2].trim();
		}
		body = body.slice(fm[0].length);
	}

	let title = path.basename(rel, ".md");
	const heading = body.match(/^#{1,3}\s+(.+)$/m);
	if (heading && body.slice(0, heading.index).trim() === "") {
		title = heading[1].trim();
		body = body.slice(heading.index + heading[0].length);
	}
	body = body.replace(/^\s+/, "");
	// Shiki 的语言名区分大小写，旧文章里的 ```JavaScript、```C 会被当成纯文本
	body = body.replace(/^(\s*```)([A-Za-z][\w+#-]*)/gm, (_, fence, lang) => fence + lang.toLowerCase());

	const published = oldMeta.date || gitFirstCommitDate(oldRepo, `docs/${rel}`);
	const category = CATEGORY_BY_DIR.find(([dir]) => rel.startsWith(`${dir}/`))?.[1] ?? "";
	const tags = [
		...new Set(
			path
				.dirname(rel)
				.split("/")
				.map((seg) => TAG_BY_SEGMENT[seg])
				.filter(Boolean),
		),
	];

	const frontmatter = [
		"---",
		`title: ${yamlString(title)}`,
		`published: ${published}`,
		`description: ${yamlString(firstParagraph(body))}`,
		`tags: [${tags.map(yamlString).join(", ")}]`,
		`category: ${yamlString(category)}`,
		"---",
		"",
	].join("\n");

	const dest = path.join(outRoot, rel);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.writeFileSync(dest, `${frontmatter}\n${body}`);
	console.log(`${rel} -> ${path.relative(process.cwd(), dest)}  [${category}] ${published}`);
}

function gitFirstCommitDate(repo, file) {
	const out = execFileSync("git", ["-C", repo, "log", "--diff-filter=A", "--format=%as", "--", file], {
		encoding: "utf8",
	}).trim();
	return out.split("\n").pop() || new Date().toISOString().slice(0, 10);
}

function firstParagraph(md) {
	let inCode = false;
	for (const raw of md.split("\n")) {
		const line = raw.trim();
		if (line.startsWith("```")) {
			inCode = !inCode;
			continue;
		}
		if (inCode || !line || /^(#|!\[|<|\||>|-{3,}|:::)/.test(line)) continue;
		const text = line
			.replace(/\*\*|__|`/g, "")
			.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
			.trim();
		if (text) return text.length > 80 ? `${text.slice(0, 80)}…` : text;
	}
	return "";
}

function yamlString(s) {
	return JSON.stringify(s);
}
