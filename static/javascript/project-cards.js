// Function to fetch the list of HTML files in the "id" subfolder
function getFileList() {
    return fetch('id/')
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data, 'text/html');
        const fileList = Array.from(htmlDoc.querySelectorAll('a'))
          .map(link => link.textContent)
          .filter(file => file.endsWith('.html'));
        console.log('File List:', fileList);
        return fileList;
      });
  }
  
  // Function to fetch the content of an HTML file
  function fetchFileContent(fileName) {
    console.log("Fetch File Content: RAN!");
    return fetch(`id/${fileName}`)
      .then(response => response.text());
  }
  
  // Function to create a card element
  function createCard(fileName, fileContent) {
    console.log("Create Card: RAN!");
    
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(fileContent, 'text/html');
    
    const title = htmlDoc.querySelector('h1').textContent;
    const description = htmlDoc.querySelector('p').textContent;
    const imageUrl = htmlDoc.querySelector('img').getAttribute('src');
    
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${imageUrl}" alt="${title}">
      <h3>${title}</h3>
      <p>${description}</p>
    `;
    card.addEventListener('click', () => {
      // Handle card click event
      console.log(`Clicked on card: ${fileName}`);
    });
    return card;
  }
  
  // Function to populate the card container with cards
  function populateCards(fileList) {
    console.log("Populate Cards: RAN!");

    const cardContainer = document.getElementById('card-container');
    fileList.forEach(fileName => {
      fetchFileContent(fileName)
        .then(fileContent => {
          const card = createCard(fileName, fileContent);
          cardContainer.appendChild(card);
        });
    });
  }
  
  // Fetch the file list and populate the cards
  getFileList()
    .then(fileList => {
      populateCards(fileList);
    })
    .catch(error => {
      console.error('Error fetching file list:', error);
    });