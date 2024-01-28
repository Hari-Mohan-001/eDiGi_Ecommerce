const openOfferForm =(productId)=>{
    
    
    const offerForm = document.getElementById('popupForm')
    offerForm.style.display = 'block'
    document.getElementById("offerProductId").value = productId
}

const createOffer = ()=>{
    console.log('create ofr');
   let productId = document.getElementById("offerProductId").value
   let discount = document.getElementById("productDiscount").value
    fetch("/admin/createProductOffer" , {
        method:"post",
        headers:{
            'Content-Type':"application/json"
        },
        body:JSON.stringify({
            productId,
            discount
        })
    })
    .then((res)=> res.json())
    .then((data)=>{
         if(data ==="success"){ 
           window.location.reload()
             
         }
    })
    .catch((error)=>console.log(error))
}

const deactivateProductOffer = (productId)=>{
       
    Swal.fire({
        title:'Are you sure you want to deactivate offer?',
        icon:'warning',
        showCancelButton:true,
        confirmButtonColor:'#008000',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!',      
      })
      .then((result)=>{
        if(result.isConfirmed){
            fetch("/admin/deactivateProductOffer" , {
                method:'post',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    productId
                })
            })
            .then((res)=>res.json())
            .then((res)=>{
                if(res==="success"){
                    window.location.reload()
                }
            })
            .catch((error)=>console.log(error))
        }
      })
}

const closeOfferform = ()=>{
    const offerForm = document.getElementById('popupForm')
    offerForm.style.display = 'none'
}

