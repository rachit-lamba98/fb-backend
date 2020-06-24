const { exec } = require('child_process');

 function deployWebsite(phoneNumber){
   return new Promise((resolve,reject)=>{
    var child = exec("./deploy.sh", function(err, result) {
        if (err) {
            console.log(err);
            reject(err);
        }
        console.log(result);
        resolve(result);
    });
     child.stdin.write(phoneNumber);
     child.stdin.end();
   })
 }

 module.exports= {deployWebsite}
 

