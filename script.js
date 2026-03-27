const oldTestament=['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'];
const newTestament=['Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
const chapterCounts={'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,'Joshua':24,'Judges':21,'Ruth':4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,'Psalms':150,'Proverbs':31,'Ecclesiastes':12,'Song of Solomon':8,'Isaiah':66,'Jeremiah':52,'Lamentations':5,'Ezekiel':48,'Daniel':12,'Hosea':14,'Joel':3,'Amos':9,'Obadiah':1,'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,'Zephaniah':3,'Haggai':2,'Zechariah':14,'Malachi':4,'Matthew':28,'Mark':16,'Luke':24,'John':21,'Acts':28,'Romans':16,'1 Corinthians':16,'2 Corinthians':13,'Galatians':6,'Ephesians':6,'Philippians':4,'Colossians':4,'1 Thessalonians':5,'2 Thessalonians':3,'1 Timothy':6,'2 Timothy':4,'Titus':3,'Philemon':1,'Hebrews':13,'James':5,'1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,'Jude':1,'Revelation':22};

let currentBook=null, currentChapter=null;
let savedReflections = JSON.parse(localStorage.getItem('savedReflections')||'[]');
let currentVerseForReflection=null;

/* --- REFLECTION CRUD --- */
function renderReflections(){
    const list=document.getElementById('reflection-list');
    list.innerHTML='';
    savedReflections.slice().reverse().forEach((r,i)=>{
        const div=document.createElement('div'); div.className='reflection-item';
        div.innerHTML=`<span><strong>${r.book} ${r.chapter}:${r.verse}</strong> - ${r.reflection}</span>`;
        
        const editBtn=document.createElement('button');
        editBtn.textContent='Edit';
        editBtn.style.background='#2980b9';
        editBtn.onclick=()=>{
            document.getElementById('reflectionText').value=r.reflection;
            currentVerseForReflection={book:r.book, chapter:r.chapter, verse:r.verse};
            document.getElementById('reflectionModal').style.display='flex';
            // Remove old reflection to update
            savedReflections.splice(savedReflections.length-1-i,1);
        };

        const delBtn=document.createElement('button'); delBtn.textContent='Delete';
        delBtn.onclick=()=>{
            savedReflections.splice(savedReflections.length-1-i,1);
            localStorage.setItem('savedReflections',JSON.stringify(savedReflections));
            renderReflections();
        };

        div.appendChild(editBtn);
        div.appendChild(delBtn);
        list.appendChild(div);
    });
}

document.getElementById('saveReflectionBtn').onclick=()=>{
    if(currentVerseForReflection){
        const text=document.getElementById('reflectionText').value.trim();
        if(!text){alert('Please enter reflection'); return;}
        savedReflections.push({...currentVerseForReflection, reflection:text});
        localStorage.setItem('savedReflections',JSON.stringify(savedReflections));
        document.getElementById('reflectionModal').style.display='none';
        renderReflections();
    }
};

document.getElementById('closeReflectionBtn').onclick=()=>{document.getElementById('reflectionModal').style.display='none';};

/* --- CREATE BOOK BUTTONS --- */
function createBookElement(book, container){
    const bookDiv=document.createElement('div');    
    bookDiv.className='book';    
    bookDiv.textContent=book;    
    bookDiv.onclick=()=>loadBook(book);    
    container.appendChild(bookDiv);    
}

/* --- LOAD BOOK & CHAPTER --- */

        function loadBook(book) {
    currentBook = book;
    const readingArea = document.getElementById('reading-area');
    readingArea.innerHTML = '';
    
    // Scroll reading area into view automatically
    readingArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Create chapter bar
    const chapterBar = document.createElement('div');
    chapterBar.style.overflowX = 'auto';
    chapterBar.style.whiteSpace = 'nowrap';
    chapterBar.style.marginBottom = '20px';
    
    for (let i = 1; i <= chapterCounts[book]; i++) {
        const chBtn = document.createElement('button');
        chBtn.textContent = i;
        chBtn.style.margin = '5px';
        chBtn.style.padding = '8px 14px';
        chBtn.style.borderRadius = '20px';
        chBtn.style.border = 'none';
        chBtn.style.cursor = 'pointer';
        chBtn.style.background = '#ecf0f1';
        chBtn.onclick = () => loadChapter(book, i);
        chapterBar.appendChild(chBtn);
    }
    readingArea.appendChild(chapterBar);
    
    const verseContainer = document.createElement('div');
    verseContainer.id = 'verse-container';
    readingArea.appendChild(verseContainer);
    
    // Load first chapter automatically
    loadChapter(book, 1);
}
function loadChapter(book,chapter){
    currentBook=book; currentChapter=chapter;
    const vc=document.getElementById('verse-container');
    vc.innerHTML='<p>Loading chapter...</p>';

    fetch(`https://bible-api.com/${encodeURIComponent(book+' '+chapter)}?translation=kjv`)
    .then(res=>res.json())
    .then(data=>{
        vc.innerHTML='';
        const title=document.createElement('h3');    
        title.textContent=`${book} Chapter ${chapter}`; title.style.marginBottom='20px';
        vc.appendChild(title);

        if(data.verses){
            data.verses.forEach(v=>{
                const verse=document.createElement('div'); verse.className='verse';
                verse.innerHTML=`<span><strong>${v.verse}</strong> ${v.text}</span>`;

                const highlightBtn=document.createElement('button'); highlightBtn.className='highlight-btn';
                highlightBtn.textContent='Highlight'; highlightBtn.onclick=()=>{ verse.classList.toggle('highlighted'); };

                const reflectBtn=document.createElement('button'); reflectBtn.className='reflect-btn';
                reflectBtn.textContent='Reflect'; reflectBtn.onclick=()=>{
                    currentVerseForReflection={book, chapter, verse:v.verse, text:v.text};
                    document.getElementById('reflectionText').value='';
                    document.getElementById('reflectionModal').style.display='flex';
                };

                verse.appendChild(highlightBtn);
                verse.appendChild(reflectBtn);
                vc.appendChild(verse);
            });
        } else vc.innerHTML='<p>No verses found.</p>';
    })
    .catch(()=>{ vc.innerHTML='<p>Error loading chapter.</p>'; });
}

/* --- DAILY VERSE --- */
function fetchDailyVerse(){
    const dv=document.getElementById('daily-verse');
    const allBooks=[...oldTestament,...newTestament];
    const book=allBooks[Math.floor(Math.random()*allBooks.length)];
    const chapter=Math.floor(Math.random()*chapterCounts[book])+1;

    fetch(`https://bible-api.com/${encodeURIComponent(book+' '+chapter)}?translation=kjv`)
    .then(res=>res.json())
    .then(data=>{
        if(data.verses && data.verses.length>0){
            const verse=data.verses[Math.floor(Math.random()*data.verses.length)];
            dv.innerHTML=`<strong>Daily Verse:</strong> ${book} ${chapter}:${verse.verse} - ${verse.text}`;
        } else dv.innerHTML='Daily Verse not available.';
    })
    .catch(()=>{ dv.innerHTML='Error fetching daily verse.'; });
}

/* --- SEARCH --- */
document.getElementById('search-btn').onclick=()=>{
    const query=document.getElementById('search-input').value.trim();
    const sr=document.getElementById('search-results');
    sr.innerHTML='Loading...'; sr.style.display='block';
    if(!query){ sr.innerHTML='Please enter a search term.'; return; }

    fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`)
    .then(res=>res.json())
    .then(data=>{
        sr.innerHTML='';
        if(data.verses && data.verses.length>0){
            data.verses.forEach(v=>{
                const div=document.createElement('div'); div.className='verse';
                div.innerHTML=`<span><strong>${data.book_name || query} ${v.verse}</strong> ${v.text}</span>`;
                const copyBtn=document.createElement('button'); copyBtn.className='highlight-btn';
                copyBtn.textContent='Copy'; copyBtn.onclick=()=>navigator.clipboard.writeText(`${data.book_name || query} ${v.verse} - ${v.text}`);
                div.appendChild(copyBtn);
                sr.appendChild(div);
            });
        } else sr.innerHTML='Verse not found.';
    })
    .catch(()=>{ sr.innerHTML='Error fetching verse.'; });
}

/* --- INITIALIZE --- */
document.addEventListener('DOMContentLoaded',()=>{
    const oldContainer=document.getElementById('old-testament-books');
    oldTestament.forEach(b=>createBookElement(b,oldContainer));
    const newContainer=document.getElementById('new-testament-books');
    newTestament.forEach(b=>createBookElement(b,newContainer));
    fetchDailyVerse();
    renderReflections();
});