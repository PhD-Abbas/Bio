document.addEventListener("DOMContentLoaded", () => {
    loadPublications();
});

async function loadPublications() {
    const listContainer = document.getElementById("pubs-list");
    
    try {
        // Fetch publications XML database
        const response = await fetch("publications.xml");
        
        if (!response.ok) {
            throw new Error("لم يتم العثور على قاعدة بيانات المنشورات.");
        }
        
        const xmlText = await response.text();
        
        // Parse XML string
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const publications = xmlDoc.getElementsByTagName("publication");
        
        // Clear skeleton loader
        listContainer.innerHTML = "";
        
        if (publications.length === 0) {
            renderEmptyState(listContainer);
            return;
        }
        
        // Loop through publications and create elements
        Array.from(publications).forEach((pub, index) => {
            const filename = pub.getElementsByTagName("filename")[0]?.textContent || "";
            const title = pub.getElementsByTagName("title")[0]?.textContent || "منشور علمي";
            const size = pub.getElementsByTagName("size")[0]?.textContent || "";
            const date = pub.getElementsByTagName("date")[0]?.textContent || "";
            
            const pdfUrl = `pubs/${encodeURIComponent(filename)}`;
            
            const card = document.createElement("a");
            card.href = pdfUrl;
            card.target = "_blank";
            card.className = "pub-card";
            card.style.transitionDelay = `${index * 0.08}s`; // staggered domino animation delay
            
            card.innerHTML = `
                <div class="pub-info">
                    <h3 class="pub-title">${title}</h3>
                    <div class="pub-meta">
                        <span><i class="far fa-calendar-alt"></i> ${date}</span>
                        <span><i class="far fa-file-pdf"></i> ${size}</span>
                    </div>
                </div>
                <div class="pub-icon-wrapper">
                    <i class="fas fa-external-link-alt"></i>
                </div>
            `;
            
            listContainer.appendChild(card);
        });
        
        // Setup scroll animation
        setupScrollReveal();
        
    } catch (error) {
        console.error("Error loading publications:", error);
        listContainer.innerHTML = "";
        renderEmptyState(listContainer, true);
    }
}

function renderEmptyState(container, isError = false) {
    const message = isError 
        ? "عذراً، حدث خطأ أثناء تحميل المنشورات العلمية." 
        : "لا توجد منشورات علمية حالياً. سيتم إضافتها قريباً.";
    const icon = isError ? "fa-exclamation-triangle" : "fa-folder-open";
    
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas ${icon}"></i>
            <p>${message}</p>
        </div>
    `;
}

function setupScrollReveal() {
    const cards = document.querySelectorAll(".pub-card");
    
    const observerOptions = {
        root: null, // viewport
        rootMargin: "0px 0px -50px 0px", // triggers slightly before scrolling fully into view
        threshold: 0.1 // 10% of card visible
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal");
                // Stop observing once animated in
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    cards.forEach(card => {
        observer.observe(card);
    });
}
