import fs from 'fs';
function generateSections(numSections) {
    const sectionTemplate = {
        "items": [
      
            {"item": "Item 1", "description": "Description of item 1", "quantity": 2, "price": "$10.00"},
  
            {"item": "Item 2", "description": "Description of item 2", "quantity": 5, "price": "$20.00"},
  
            {"item": "Item 3", "description": "Description of item 3", "quantity": 3, "price": "$15.00"},
  
            {"item": "Item 1", "description": "Description of item 1", "quantity": 2, "price": "$10.00"},
  
            {"item": "Item 2", "description": "Description of item 2", "quantity": 5, "price": "$20.00"},

            {"item": "Item 1", "description": "Description of item 1", "quantity": 2, "price": "$10.00"},
  
            {"item": "Item 2", "description": "Description of item 2", "quantity": 5, "price": "$20.00"},
  
            {"item": "Item 3", "description": "Description of item 3", "quantity": 3, "price": "$15.00"},
  
            {"item": "Item 1", "description": "Description of item 1", "quantity": 2, "price": "$10.00"},
  
            {"item": "Item 2", "description": "Description of item 2", "quantity": 5, "price": "$20.00"},
  
            {"item": "Item 3", "description": "Description of item 3", "quantity": 3, "price": "$15.00"}
  
        ]
    };
    
    return Array.from({ length: numSections }, () => sectionTemplate);
  }
  
  // Generate 100 identical sections
  const dummyData = {
    title: "Comprehensive Report",
    introduction: "This is a comprehensive report generated dynamically.",
    sections: generateSections(100),
    details: "Here are the details of the report.",
    currentDate: new Date().toLocaleDateString('en-US')
  };
  
  // Write the generated data to a JSON file (optional)
  fs.writeFileSync('./data/data.json', JSON.stringify(dummyData, null, 2));
  