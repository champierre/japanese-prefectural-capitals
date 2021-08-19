const pdfreader = require("pdfreader")
const fs = require("fs")
const https = require('https')

const pdfPath = "https://www.gsi.go.jp/KOKUJYOHO/CENTER/kendata/zenken.pdf"
const apiFile = "./api/index.json"
const pdfFile = "./data/zenken.pdf"

let prefectures = {}
let prefecture
let latOrLng

const convertToDecimal = (str) => {
    let degree, minute, second
    if (str.length === 9) {        
        degree = Number(str.substr(0, 3))
        minute = Number(str.substr(3, 2))
        second = Number(str.substr(6, 2))
    } else {
        degree = Number(str.substr(0, 2))
        minute = Number(str.substr(2, 2))
        second = Number(str.substr(5, 2))
    }
    return degree + minute / 60 + second / 3600
}

const parsePdf = () => {
    new pdfreader.PdfReader().parseFileItems(pdfFile, function (err, item) {
        if (err) {
            console.error(err)
        } else if (!item) {
            fs.writeFileSync(apiFile, JSON.stringify(prefectures))
        } else if (item.text) {
            if (/^(.+[都道府県])$/.test(item.text)) {
                prefecture = item.text
                prefectures[prefecture] = {lat: null, lng: null}
            } else if (/^緯度$/.test(item.text)) {
                latOrLng = 'lat'
            } else if (/^経度$/.test(item.text)) {
                latOrLng = 'lng'
            } else if (/^\d+′\d+″$/.test(item.text)) {
                if (!prefectures[prefecture][latOrLng]) {
                    prefectures[prefecture][latOrLng] = convertToDecimal(item.text)
                }
            }
        }
    })
}

// main
if (fs.existsSync(apiFile)) {
    fs.unlinkSync(apiFile)
}

if (fs.existsSync(pdfFile)) {
    fs.unlinkSync(pdfFile)
}

const file = fs.createWriteStream(pdfFile)
const request = https.get(pdfPath, function(response) {
    response.pipe(file)
    file.on('finish', () => {
        file.close(parsePdf)
    })
})