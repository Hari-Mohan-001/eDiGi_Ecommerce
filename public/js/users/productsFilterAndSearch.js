const sort = document.getElementById("sortBy")
const categories = document.getElementById("categories")
const productSearch = document.getElementById("search")
const brand = document.getElementById("brand")

categories.addEventListener('change',()=>{  
    const categoryId = categories.value  
    const sortValue = sort.value
    const searchValue = productSearch.value
    const brandValue = brand.value
    const url = `/allProducts?category=${categoryId || ""}&sortBy=${sortValue}&search=${searchValue}&brand=${brandValue}`
    window.location.href = url
})

sort.addEventListener('change', ()=>{
    const categoryId = categories.value
    const sortValue = sort.value
    const searchValue = productSearch.value
    const brandValue = brand.value
    const url = `/allProducts?category=${categoryId || ""}&sortBy=${sortValue}&search=${searchValue}&brand=${brandValue}` 
    window.location.href = url 
    
})

brand.addEventListener('change', ()=>{
    const categoryId = categories.value
    const sortValue = sort.value
    const searchValue = productSearch.value
    const brandValue = brand.value
    const url = `/allProducts?category=${categoryId || ""}&sortBy=${sortValue}&search=${searchValue}&brand=${brandValue}` 
    window.location.href = url 
})

const searchForm = document.getElementById("searchForm")

searchForm.addEventListener('submit' ,(e)=>{
       e.preventDefault()

    const categoryId = categories.value
    const sortValue = sort.value
    const searchValue = productSearch.value
    const brandValue = brand.value
    const url = `/allProducts?category=${categoryId || ""}&sortBy=${sortValue}&search=${searchValue}&brand=${brandValue}` 
   
    window.location.href = url
   

})