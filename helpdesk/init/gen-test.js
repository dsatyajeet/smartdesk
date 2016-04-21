/**
 * Created by satyajeet on 24/12/15.
 */

var myobj={a:'a',b:'b'};

console.log(myobj.a);

var myobj2=myobj;
myobj={};
console.log(myobj2.a);
//myobj2.a='c';
console.log(myobj2.a);
console.log(myobj.a);
