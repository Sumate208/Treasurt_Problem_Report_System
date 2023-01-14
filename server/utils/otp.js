function generateOTP () {
    const result = [];
    const characters = '0123456789';
    for (var i = 0; i < 6; i++) {
      result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
   }
   return result.join('');
}

module.exports = {
    generateOTP
}