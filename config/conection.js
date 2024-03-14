const mongoose =require('mongoose')
const ds = mongoose.connection;





const state = {
    db:null
}

const connectDB= async ()=> {
    try{
    const conn = await mongoose.connect('mongodb://0.0.0.0:27017/shopping',).then((data)=>{
       state.db=data.db
    })

    console.log('mongodb connected');
    }catch(error) {
        console.log('error');
        process.exit(1);
    }}





module.exports=connectDB;


   
    








