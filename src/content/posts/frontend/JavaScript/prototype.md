---
title: "JavaScript原型链"
published: 2021-08-01
description: "从一个构造函数和实例的角度来看原型链关系"
tags: ["JavaScript"]
category: "前端基础"
---

#### 引例

从一个构造函数和实例的角度来看原型链关系

```js
function Person(){
  this.name = 'anymous'
}
P = new Person();
console.log(P.name) //anymous
```

Person是构造函数，p是`Person`实例化出来的对象，`Person.prototype`是实例的原型对象

- 原型对象(Person.prototype)的属性`constructor`指向原构造函数
- 构造函数(Person)的属性`prototype`指向实例原型对象
- 构造函数的实例(p)的`__proto__`指向实例原型对象
- Person实例化出来的对象P，同时P的constructor属性会指向Person

简单来说画个图就是这么个关系

![image-20210713102828536](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210713102828536.png)

```js
//证明上面的图
console.log(P.constructor == Person) //true
console.log(Person.prototype)
console.log(Person.prototype.constructor == Person) //true
console.log(P.__proto__ == Person.prototype) //true
```

到这估计你可能有点懵，这些概念都是什么玩意？

我给这部分想了个故事：`Person`当做父母，`P`是娃，`Person.prototype`是老师。娃刚一生(娃先拥有了父母的属性方法)，然后父母就给娃找老师教本事，父母能通过`prototype`找到老师(哪个老师教的娃)，老师也能通过`constructor`找到父母(知道这谁生的娃)，娃能通过`__proto__`找到老师，同时娃也能通过`constructor`来找到父母，并且由于跟着老师学本事，通过`__proto__`可以获得老师的学识，比如当有人问这个娃一个问题的时候，娃就去老师那里去问，老师如果不会就去老师的老师那里去问(就像一条链条一样)。当然此处娃(实例)可能不止一个，但是老师(实例原型对象)和父母(构造函数)是唯一的。

![image-20210802193838375](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210802193838375.png)

这里定义几个故事的设定：

1. 当徒弟获取一个知识。徒弟首先看看自己知道不，如果自己不知道那就去问师父，如果师父不会就会去问师父的师父，只要这条师徒线上有人会，徒弟就能了解到这个东西。当然，如果中途换了师父，那就只能找换后的师徒线去获取了

   师徒线：徒-师父-师父的师父-师父的师父的师父-...

   证明

   ```js
   console.log(P.name) //徒弟本身就有的属性，不需要问师父
   ```

   师父，也就是Person.prototype是构造函数一创建跟着创建好的对象，我们可以给师父添加一个技能

   ```js
   Person.prototype.skill = "精通JavaScript的拼写"
   ```

   看看徒弟(娃/P实例)能不能获取到

   ```js
   console.log(P.skill) //精通JavaScript的拼写
   ```

   可以看到徒弟是可以从师父那获取到属性的。这就是JavaScript实现继承的方式。

   还有一种情况，如何给娃改变老师，娃可以直接改变自己的`__proto__`指向

   ```js
   //改变P实例的__proto__指向
   P.__proto__ = {
   	teacher:'新老师'
   }
   console.log(P.teacher) //新老师

   ```

   有人可能会想，那让父母直接给所有实例都替换新的老师不行吗，也就是改变Person构造函数的`prototype`，让这个属性指向一个新的对象

   ```js
   //Person构造函数的prototype
   Person.prototype = {
   	teacher:'新老师'
   }
   console.log(P.teacher) //undefined
   console.log(P.__proto__ == Person.prototype) //false
   P2 = new Person()
   console.log(P2.teacher) //新老师
   ```

   可以看到，虽然Person构造函数改变了prototype指向，但是之前声明的对象P依然不能使用Person.prototype的属性teacher，通过验证我们知道P的`__proto__`指向的并不是更换后的Person.prototype，而是之前那个Person.prototype。

   结论是什么呢，<span style="color:red">就是说Person构造函数一创建，JS就会创建Person.prototype属性，当Person构造函数创建实例对象的时候，JS引擎就会把实例对象(P)的`__proto__`属性指向当前的Person.prototype，后期若是要改变Person.prototype，之前创建的实例依然指向的是之前的Person.prototype，也就是说只能改变之后创建的实例。</span>

   按故事来讲就是娃长大了，以后自己找的老师父母也就干预不了了，若是父母给娃换老师也只能是给之后的娃换。

   <span style="color:blue">有一点需要注意，`__proto__`是隐藏属性，不能在生产环境中用，会很耗费性能。</span>

2. 师父可以通过`constructor`找到徒弟的父母，徒弟也可以通过`constructor`找到自己的父母

   证明

   ```js
   P.constructor == Person.prototype.constructor //true
   ```

   当然，还是一样，如果哪个娃自己换了师父，那他的师父的constructor不会指向徒弟的父母，这也很好理解，毕竟本身就不是父母找下的嘛。

   ```js
   newTeacher = {
   	teacher:'新老师'
   }
   P.__proto__ = newTeacher
   console.log(newTeacher == Person.prototype) // false
   ```



上面这个三角仅仅是原型链的一个角落，还有很多不知道的，比如上面说了师徒链，但并不完全，那Person.prototype的师父是谁呢？又是谁创建的呢？更新一下图。

![image-20210712114203178](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210712114203178.png)

可以看到Person.prototype是Object创建的，这个很好理解，因为他是一个对象嘛。

```js
var obj = new Object()
console.log(obj.__proto__ == Person.prototype.__proto__) //true
```

可以看到Person.prototype和Object创建出来的obj的`__proto__`指向是一样的，因为他们都是Object的娃。

结果相当于什么呢，就是Object是Person.prototype的父母，而Object.prototype就是Object给Person.prototype找的老师。

同时我们注意到Object创建了Person.prototype，但是Person.prototype的constructor并不是指向Object，而是原构造函数，这算是一种设定吧，但是感觉不是很符合直觉。<span style="color:red">也就是说如果是实例，constructor会指向实例的构造函数，如果是实例的原型对象，那constructor还是会指向原实例的构造函数，这个属性相当于是定好的。</span> 哪怕Person改变prototype的指向到一个新的对象，之前创建好的实例的原型对象的contructor依然指向Person构造函数。

> 只要创建了一个新函数，就会根据一组特定的规则为该函数(Person)创建一个prototype属性，这个属性指向函数的原型对象(Person.prototype)。在默认情况下，所有原型对象都会自动获得一个constructor（构造函数）属性，这个属性包含一个指向prototype属性所在函数的指针。
> 引用自《JavaScript高级程序设计》

更新一下师徒链：P实例 >> Person.prototype >> Object.prototype



Object.prototype是谁呢，他还有师父吗？再更新一下图

![image-20210712115033405](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210712115033405.png)

更新一下师徒链：P实例 >> Person.prototype >> Object.prototype>> null

可以看到Object.prototype的师父是`null`，你可以这么理解，Object.prototype已经是祖师爷级别的人了，他的一身本事都是从无到有的过程，所以他的师父就是空，也就是`null`。

> null表示没有对象，你可以理解这里的意思为Object.prototype就没有实例原型对象



Person和Object同样都是构造函数，但也是实例对象，他们是由谁创建的呢？他们的实例原型对象又是谁？再次更新图。下面是最终图

![image-20210718174103107](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210718174103107.png)

可以看到构造函数(Person,Object包括Function自己)的constructor都指向了Function，我们可以知道是Function创建了这些构造函数，由此也就可以推出Function相当于是Person,Object的父母，就是说Person和Object就会指向Function给他们找的老师Function.prototype。

这里有几点需要注意。

1. Function很特别，他的constructor指向自己，`__proto__`也和其他构造函数一样是指向`Function.prototype`，Function就相当于祖先，祖先的老师就是自己找的(因为没人创建Function)，也合理。
2. 唯一一点不太符合思维的就是虽然Object和Person的实例原型对象都是Function.prototype，但是由于Function.prototype依然是Object创建的，所以Function.prototype的师父(`.__proto__`)依然还是Object.prototype。

### 小结

原型链实际上就是一个继承的链条，就相当于我上面所说的师徒链，可以简单理解为由`__proto__`组成的链条

![image-20210718182627268](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210718182627268.png)

通过这条链条下游的对象访问一些属性的时候若自身没有，就会去上游寻找是否有这个属性，上游有这个属性下游就能获取到。

### 例子：拓展属性和方法

比如说普通用户User和管理员Admin，普通用户有用户名和密码和可以登录，管理员除了普通用户的功能，还有一个删库能力。

<img src="https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210712151631272.png" alt="image-20210712151631272" style="zoom:25%;" />

```js
function User(name,password){
	this.name = name;
	this.password = password;
	this.login = function(){
		console.log(this.name+"登录成功")
	}
}
function Admin(name,password){
  this.name = name;
	this.password = password;
	this.deleteDatabase = function(){
		console.log("rm -rf /*")
	}
}
```

Admin可以使用自己原型上的属性和方法，User的实例上包含User的所有属性和方法，将Admin.prototype指向一个new User()(也就是User的实例对象)。过程就是先是将Admin的prototype属性指向了User的实例对象，然后Admin实例化一个对象admin，此时admin有了Admin上的属性和方法，同时会被`__proto__`属性连接到User的实例对象上，也就同时可以使用Admin上的属性方法和User实例上的属性方法。

```js
Admin.prototype = new User()
let admin = new Admin('an',123456)
admin.login() //an登录成功
admin.deleteDatabase() //rm -rf /*
```

### 总结：

1.所有的构造函数都是Function创建的，比如示例里的Person也包括Object，因此构造函数和Object的原型都是`Function.prototype`

2.构造函数创建了对应的实例对象，Object(也是构造函数)创建了所有的原型对象，所有构造函数的实例对象的原型指向`构造函数.prototype`。

我总结出来一个规律，A创造了B，那么`B.__proto__==A.prototype`

1.比如Function创建了Person和Object，那结论就是

```js
function Person(){
	this.name="Anonymous"
}
console.log(Person.__proto__ == Function.prototype)//true
console.log(Object.__proto__ == Function.prototype)//true
```

2.构造函数创建了实例对象，Object则是创建了实例的原型对象，结论是

```js
function Person(){
	name:"Anonymous"
}
P = new Person()
console.log(P.__proto__ == Person.prototype) //true
console.log(Person.prototype.__proto__== Object.prototype)//true
console.log(Function.prototype.__proto__== Object.prototype)//true
```

有一个问题，`Object.prototype`也应该是一个原型对象吧，那`Object.prototype.__proto__`是不是也指向`Object.prototype`？虽然`Object.prototype`的确也是原型对象，但是这是一个例外，`Object.prototype.__proto__`指向的是null，应该是JS出于设计上的考虑。

```js
console.log(Object.prototype.__proto__==Object.prototype)//false
console.log(Object.prototype.__proto__==null)//true
```

### 应用场景

> 为什么判断对象类型可以使用 Object.prototype.toString() 来判断对象数据类型呢

```js
Object.prototype.toString({})       // "[object Object]"
Object.prototype.toString.call({})  // 同上结果，加上call也ok
Object.prototype.toString.call(1)    // "[object Number]"
Object.prototype.toString.call('1')  // "[object String]"
Object.prototype.toString.call(true)  // "[object Boolean]"
Object.prototype.toString.call(function(){})  // "[object Function]"
Object.prototype.toString.call(null)   //"[object Null]"
Object.prototype.toString.call(undefined) //"[object Undefined]"
Object.prototype.toString.call(/123/g)    //"[object RegExp]"
Object.prototype.toString.call(new Date()) //"[object Date]"
Object.prototype.toString.call([])       //"[object Array]"
Object.prototype.toString.call(document)  //"[object HTMLDocument]"
Object.prototype.toString.call(window)   //"[object Window]"
```

上面是使用的方法，那可以不可以直接对象调用toString呢

```js
'1'.toString() //"1"
Object.prototype.toString.call('1')  // "[object String]"
```

可以看到这样的结果是不同的，这是什么原因呢？就是字符串对象重写了Object.prototype上的toString方法，因此直接调用的是重写后的方法，有很多Object实例对象都重写了Object的实例原型对象的toString方法，只有用Object.prototype.toString.call(<对象>)才能返回对应的类型。

辅助证明一下

```js
var arr=[1,2,3];
console.log(Array.prototype.hasOwnProperty("toString"));//true
console.log(arr.toString());//1,2,3
console.log(Object.prototype.toString.call(arr)) //"[object Array]")
delete Array.prototype.toString;//delete操作符可以删除实例属性
console.log(Array.prototype.hasOwnProperty("toString"));//false
console.log(arr.toString());//"[object Array]"
```

可以看到Array自身的toString本身是`1，2，3`，但是删除掉后就调用的是Object.prototype上的toString了，结果就和直接用Object.prototype.toString.call(arr)的效果一样了。

> 在Vue2中注册全局方法

main.js中，Vue就像一个构造函数，这样就相当于是在Vue的实例对象上添加了这个md5方法

![image-20210801220227751](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210801220227751.png)

这样在项目中就可以用this.$md5调用这个方法了。

![image-20210801222049295](https://typora-an.oss-cn-hangzhou.aliyuncs.com/%E5%89%8D%E7%AB%AF/image-20210801222049295.png)
