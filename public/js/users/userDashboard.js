document.getElementById("wishlist-tab").addEventListener("click", (event)=>{
    window.location.href = "/wishlist"
})

document.getElementById("wallet").addEventListener("click" , (event)=>{
    window.location.href = "/wallet"
})

document.getElementById("orders-tab").addEventListener("click", (event)=>{
    window.location.href = "/orders"
})

document.getElementById("address-tab").addEventListener("click" , (event)=>{
    window.location.href = "/address"
})

document.getElementById("changePassword-tab").addEventListener("click" , (event)=>{
    window.location.href = "/changePassword"
})

document.getElementById("cart-tab").addEventListener("click" , (event)=>{
    window.location.href = "/myCart"
})


const uploadInput = document.getElementById("upload")   
const imageView = document.getElementById("imgView")
console.log('change');

uploadInput.addEventListener("change" , (event)=>{
  console.log('upload');
  const file = event.target.files[0]
  const reader = new FileReader()

  reader.onload = function(e){
      console.log('imgsrc');
imageView.src = e.target.result
  }

  if(file){
      reader.readAsDataURL(file);
      const formData = new FormData()
      formData.append('image', file)

      fetch("/uploadProfileImage", {
          method:'post',
          body:formData

      })
      .then((res)=> res.json())
      .then(data=>{
          if(data.success){
              console.log('changed');
          }
      })
      .catch((error)=>console.log(error))
  }
  
})