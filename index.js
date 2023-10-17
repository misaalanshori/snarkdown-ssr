// ExpressJS server that renders markdown files in the public folder using snarkdown and serves them as html with a template body
// the public folder can be configured by the environment variable PUBLIC_FOLDER

// Import dependencies
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const snarkdown = require('snarkdown');
const path = require('path');

// Create express app
const app = express();

// Set the port
const port = process.env.PORT || 3000;

// Set the public folder
const publicFolder = process.env.PUBLIC_FOLDER || 'public';

// Make folder if it doesnt exist
if (!fs.existsSync(publicFolder)) {
    fs.mkdirSync(publicFolder);
}

// Set the template file
const templateFile = process.env.TEMPLATE_FILE || 'template.html';

// Set the template function
const template = (title, body) => {
    const templateHtml = fs.readFileSync(templateFile, 'utf8');
    return templateHtml.replace('{{body}}', body).replace('{{title}}', title);
}

// Create a route that will map to the public folder and return a markdown file as html without the .md extension. if no path is given then index.md will be returned
app.get('/:path?', (req, res) => {
    // Get the path from the request
    const path = req.params.path || 'index';

    // Get the file path
    const filePath = `${publicFolder}/${path}.md`;

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Read the file
        fs.readFile(filePath, 'utf8', (err, data) => {
            // Check for errors
            if (err) {
                // Log the error
                console.error(err);

                // Return a 500 error
                return res.status(500).send('Internal Server Error');
            }

            // Convert the markdown to html
            const html = snarkdown(data);

            // Return the html
            return res.send(template(path+".md",html));
        });
    } else {
        // Return a 404 error
        return res.status(404).send('Not Found');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});