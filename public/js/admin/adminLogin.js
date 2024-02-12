const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
document.getElementById('email').addEventListener("input", {
    
})

const submitLogin =(event)=>{
    document.getElementById('loginForm').addEventListener("submit",(e)=>{
        e.preventDefault()
    })

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    if(!emailRegex.test(email)){
        document.getElementById('emailError').innerText = 'Invalid mail format'
        return
    }else{
        document.getElementById('emailError').innerText = ''  
    }

    fetch("/admin/login" , {
        method:'post',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            email,
            password
        })
    })
    .then((res)=>res.json())
    .then(data=>{
        if(data.success){
            window.location.href="/admin/dashboard"
        }else{
            document.getElementById("errorMessage").innerText = data.message
        }

    })
    .catch((error)=>console.log(error))
}