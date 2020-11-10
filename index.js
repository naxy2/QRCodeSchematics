//caratteri:    █            ▄       ▀
//codici:       9608 - 32 - 9604 - 9600
const { exec } = require("child_process")
fs = require('fs')
qr = require('qrcode-generator')(0, 'L')
args = process.argv

link = args[2]
nome = args[3]

if (!link | !nome){
    console.log("not enough arguments")
    return
}

qr.addData(link)
qr.make()
lettere = qr.createASCII().split('\n');
larghezza = lettere[0].length
altezza = lettere.length*2
bits = []
for (i=0; i<altezza; i++){
    bits.push([])
}


for (i=0; i<larghezza; i++){
    for (j=0; j<altezza/2; j++){
        switch (lettere[j].charCodeAt(i)){
            case 9608:
                bits[j*2][i] = 1
                bits[j*2+1][i] = 1
                break
            case 32:
                bits[j*2][i] = 0
                bits[j*2+1][i] = 0
                break
            case 9604:
                bits[j*2][i] = 0
                bits[j*2+1][i] = 1
                break;
            case 9600:
                bits[j*2][i] = 1
                bits[j*2+1][i] = 0
                break;
        }
    }
}

i = 0
while(i<bits[bits.length-1].length && bits[bits.length-1][i] == 0) i++;
if (i == bits[bits.length-1].length){
    bits = bits.slice(0,bits.length-1)
    altezza--;
}

bianchi = 0
neri = 0

stringaBlocchi = ""
for (i=0; i<bits.length; i++){
    for(j=0; j<bits[i].length; j++){
        if (bits[bits.length-1-i][j] == 1){
            stringaBlocchi += "3B, "
            bianchi++
        }else{
            stringaBlocchi += "12B, "
            neri++
        }
    }
}
stringaBlocchi = stringaBlocchi.slice(0,stringaBlocchi.length-2)

/*
'{'+
    'Blocks: [B; '+stringaBlocchi+'],'+
    'Width: 1s,'+
    'Height: '+n+'s,'+
    'Length: '+n+'s,'+
    'Materials: "Alpha",'+
    'TileEntities: [],'+
    'Entities: []'+
'}'
*/

fs.writeFile("./steps/in/"+nome+".snbt", 
'{'+
    'Blocks: [B; '+stringaBlocchi+'],'+
    'Width: '+larghezza+'s,'+
    'Height: '+altezza+'s,'+
    'Length: 1s,'+
    'Materials: "Alpha",'+
    'TileEntities: [],'+
    'Entities: []'+
'}', ()=>{
    console.log(qr.createASCII())
    exec("java -cp server.jar net.minecraft.data.Main --client --input ./steps/in --output ./steps/out", (error, stdout, strerr)=>{
        fs.rename(`./steps/out/${nome}.nbt`, `./steps/out/${nome}.schematic`, ()=>{
            console.log(`Bianchi: ${bianchi}\nNeri: ${neri}`)
        })
    });
})