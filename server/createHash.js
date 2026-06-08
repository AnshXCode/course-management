import bcrypt from "bcrypt";


const hash = bcrypt.hashSync('password', 10);

// Yes, this script is okay to create a temporary hash.
// It uses bcrypt to hash the string 'password' with a salt round of 10 and prints the result.
console.log(hash);