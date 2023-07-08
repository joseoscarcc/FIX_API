const fs = require('fs');
const FiixCmmsClient = require('fiix-cmms-client');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();


app.use(bodyParser.urlencoded({ extended: true }));

const fiixCmmsClient = new FiixCmmsClient();
fiixCmmsClient.setBaseUri(process.env.BASE_URI);
fiixCmmsClient.setAppKey(process.env.APP_KEY);
fiixCmmsClient.setAuthToken(process.env.AUTH_TOKEN);
fiixCmmsClient.setPKey(process.env.P_KEY);

// Serve the HTML file with the form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle the form submission
app.post('/process-form', (req, res) => {
  const selectedItems = req.body.items; // Assuming the checkboxes have a name of "items"
  const idname = req.body.idname; // Retrieve the value of the input field named "idname"

  // Modify the fiixCmmsClient.find() call to fetch the query results
  fiixCmmsClient.find({
    className: 'Asset',
    filters: [
      { ql: 'id = ?', parameters: [idname] }
    ],
    fields: selectedItems.filter(field => field !== '').join(', '), // Filter out empty fields
    callback: function(ret) {
      if (!ret.error) {
        const objects = ret.objects.slice(0, 5); // Retrieve the first 5 objects from the result

        // Generate an HTML table based on the query results
        let tableHTML = '<table><tr>';
        const fields = Object.keys(objects[0]);
        fields.forEach(field => {
          tableHTML += `<th>${field}</th>`;
        });
        tableHTML += '</tr>';

        objects.forEach(object => {
          tableHTML += '<tr>';
          fields.forEach(field => {
            tableHTML += `<td>${object[field]}</td>`;
          });
          tableHTML += '</tr>';
        });

        tableHTML += '</table>';

        res.send(tableHTML); // Send the HTML table as the response
      } else {
        res.send(ret.error); // Send the error message as the response
      }
    }
  });
});



// RPC call to Ping with a simple callback
fiixCmmsClient.rpc({
  "name": "Ping",
  "callback": function(ret) {
    if (!ret.error) {
      console.log("You have successfully made your first call to the API.");
    } else {
      console.error(ret.error);
    }
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});