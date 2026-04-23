const fs = require('fs');
const path = require('path');

function removeItalicFromDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            removeItalicFromDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Remove 'italic' from classNames
            // We want to match 'italic' as a whole word, especially inside class strings.
            // Be careful not to replace 'italic' if it's part of another word, though tailwind uses just 'italic'
            const newContent = content.replace(/\bitalic\b/g, '').replace(/  +/g, ' '); // Clean up double spaces
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

removeItalicFromDirectory(path.join(__dirname, 'client', 'src'));
console.log('Done removing italic class from all files.');
