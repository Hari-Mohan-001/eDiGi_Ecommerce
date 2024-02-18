
const reduceQuantity = async(id)=>{

    const productId = id
    const quantity = document.querySelector(`[quantity-id="${id}"]`).value
     console.log('fetch');
    fetch("/quantityUpdate" ,{
        method:"post",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            productId
        })
    })
    .then((res)=> res.json())
    .then(data=>{
        if(data.success){
            console.log('success');
           
            let newValue =parseInt(quantity)-1
            
            document.querySelector(`[quantity-id="${id}"]`).value = newValue
            const productTotal = data.price*newValue
            console.log(newValue);
            document.querySelector(`[productTotal-id="${id}"]`).textContent = `Rs: ${productTotal}`

            if(newValue === data.stock){ 
                document.querySelector(`[addToCartBtn-id="${id}"]`).disabled = true
             }else{
                document.querySelector(`[addToCartBtn-id="${id}"]`).disabled = false 
             }


             if(newValue ===1){
                console.log('minus disable'); 
                document.querySelector(`[reduceBtn-id="${id}"]`).disabled = true
             }else{
                document.querySelector(`[reduceBtn-id="${id}"]`).disabled = false
             }

              fetch("/getCartTotal" , {
                method:'get',

              })
              .then((res)=> res.json())
              .then(data=>{
                if(data.success){
                    console.log(data.message);
                    const total = document.getElementById("cartTotal") 
                    const subTotal = document.getElementById("subTotal")
                    total.textContent ='Rs:'+ data.message
                    subTotal.textContent ='Rs:'+ data.message

                }
              })
        }
    })
    .catch((error)=> console.log(error))
}


const addToCart =async(id)=>{
    const productid = id
    const quantity = document.querySelector(`[quantity-id="${id}"]`).value
    fetch("/addToCart", {
        method:"post",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            productid
        })
    })
    .then((res)=>res.json())
    .then(data=>{
        if(data.success){
            
            let newValue =parseInt(quantity)+1
            document.querySelector(`[quantity-id="${id}"]`).value = newValue
           const productTotal = data.price*newValue
           document.querySelector(`[productTotal-id="${id}"]`).textContent = `Rs: ${productTotal}`
           if(newValue >1){
            document.querySelector(`[reduceBtn-id="${id}"]`).disabled = false
           }else{
            document.querySelector(`[reduceBtn-id="${id}"]`).disabled = true
           }
             if(newValue === data.stock){ 
                document.querySelector(`[addToCartBtn-id="${id}"]`).disabled = true
             }else{
                document.querySelector(`[addToCartBtn-id="${id}"]`).disabled = false 
             }

             fetch("/getCartTotal", {
                method:"get"
             })
             .then((res)=>res.json())
             .then(data=>{
                if(data.success){
                    console.log(data.message);
                    const total = document.getElementById("cartTotal")
                    const subTotal = document.getElementById("subTotal")
                    total.textContent ='Rs:'+ data.message
                    subTotal.textContent ='Rs:'+ data.message  
                }
             })

        }
    })
    .catch((error)=>console.log(error))
}

const removeItem =async(id)=>{
const productid = id

Swal.fire({
    title:'Are you sure you want to remove the item from cart?',
    icon:'warning',
    showCancelButton:true,
    confirmButtonColor:'#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes!',      
  })
  .then((result)=>{
            if(result.isConfirmed){

  fetch("/removeItem" ,{
        method:'post',
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            productid
        })
  })
  .then((res)=>res.json())
  .then(data=>{
    if(data.success){
     console.log('row delete');
     const count = document.getElementById("cartCount").textContent
     let parsedCount = parseInt(count)
       const row=  document.querySelector(`[data-id="${id}"]`)
       row.remove()
       let newCount = parsedCount-1
       document.getElementById("cartCount").textContent  = newCount


       fetch("/getCartTotal", {
        method:"get"
     })
     .then((res)=>res.json())
     .then(data=>{
        if(data.success){
            console.log(data.message);
            const total = document.getElementById("cartTotal")
            const subTotal = document.getElementById("subTotal")
            total.textContent ='Rs:'+ data.message 
            subTotal.textContent ='Rs:'+ data.message   
        }else{
            window.location.reload()
        }
     })
       
    }
  })
  .catch((error)=>console.log(error))

}
})
}



