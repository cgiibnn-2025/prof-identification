const fs = require('fs');
const path = require('path');

// Lire le fichier etab.json
const etabData = JSON.parse(fs.readFileSync('./etab.json', 'utf8'));

// Lister les fichiers dans le dossier LOGO
const logoFiles = fs.readdirSync('./LOGO/');

console.log('=== Vérification des logos ===\n');

let missing = [];
let found = 0;

etabData.forEach((uni, index) => {
    const logoPath = uni.path.replace('LOGO/', '');
    const exists = logoFiles.includes(logoPath);
    
    if (!exists) {
        missing.push({
            index: index + 1,
            name: uni.name,
            shortname: uni.shortname,
            expectedPath: logoPath
        });
    } else {
        found++;
    }
});

console.log(`✅ Logos trouvés: ${found}/${etabData.length}`);
console.log(`❌ Logos manquants: ${missing.length}\n`);

if (missing.length > 0) {
    console.log('Logos manquants:');
    missing.forEach(item => {
        console.log(`- ${item.name} (${item.shortname}) → ${item.expectedPath}`);
    });
    
    console.log('\nFichiers disponibles qui pourraient correspondre:');
    missing.forEach(item => {
        const possibleMatches = logoFiles.filter(file => 
            file.toLowerCase().includes(item.shortname.toLowerCase()) ||
            item.shortname.toLowerCase().includes(file.toLowerCase().replace('.png', ''))
        );
        if (possibleMatches.length > 0) {
            console.log(`${item.shortname} → Possibles: ${possibleMatches.join(', ')}`);
        }
    });
} else {
    console.log('🎉 Tous les logos sont présents!');
}
