const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjg0N2MwOWEzMjBiMzZkZTE4ZDFlOTRkIiwicm9sZSI6Im1hbmFnZXIifSwiaWF0IjoxNzQ5NjI1NTQ3LCJleHAiOjE3NDk3MTE5NDd9.3UNorq97K3Jk-YvEBGPc6G7RGo-eus6xELuJWj3dCNM'

async function allDesigns(){
    try{
        const response=await fetch('http://localhost:5000/api/designs/all',{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        const data=await response.json()
        data.forEach((res)=>{
            console.log(res.title)
        })
       


    }
    catch(err){
        console.log('data fetch failed',err)

    }
}
allDesigns()