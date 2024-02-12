const openOfferForm =(categoryId)=>{
    
    
    const offerForm = document.getElementById('popupForm')
    offerForm.style.display = 'block'
    document.getElementById("offerProductId").value = categoryId
}

const createOffer = ()=>{
    console.log('create ofr');
   let categoryId = document.getElementById("offerProductId").value
   let discount = document.getElementById("productDiscount").value
    fetch("/admin/createCategoryOffer" , {
        method:"post",
        headers:{
            'Content-Type':"application/json"
        },
        body:JSON.stringify({
            categoryId,
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

const deactivateCategoryOffer = (categoryId)=>{
       
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
            fetch("/admin/deactivateCategoryOffer" , {
                method:'post',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                   categoryId
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

