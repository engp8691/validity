var arr=[1,2,3,4,5,6,7,8,9,10];

let flag = true;
let pointer = 0;
arr.forEach(elem=>{
  console.log(elem, arr.length);
  pointer++;
  
  if(flag){
    arr.splice(pointer, 1);
	console.log(arr);
  }
  flag = !flag;
  flag = true;
})

