document.addEventListener("DOMContentLoaded", () => {
    loadPublications();
});

async function loadPublications() {
    const listContainer = document.getElementById("pubs-list");
    
    try {
        // Fetch publications XML database with a cache buster
        const response = await fetch("publications.xml?t=" + new Date().getTime());
        
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
            card.href = "javascript:void(0)";
            card.className = "pub-card";
            card.onclick = (e) => {
                e.preventDefault();
                openPdfModal(pdfUrl, title);
            };
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

// Modal Functions
function openPdfModal(url, title) {
    const modal = document.getElementById("pdf-modal");
    const viewer = document.getElementById("pdf-viewer");
    const downloadBtn = document.getElementById("pdf-download-btn");
    const modalTitle = document.getElementById("modal-title");
    
    modalTitle.textContent = title;
    // Append #view=FitH to try and force mobile browsers to display rather than download, though iOS Safari handles it natively.
    viewer.src = url + "#view=FitH";
    downloadBtn.href = url;
    // Set the download attribute so the user can download the file
    downloadBtn.setAttribute("download", title + ".pdf");
    
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Setup modal close handlers once DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("pdf-modal");
    const closeBtn = document.getElementById("close-modal");
    
    if(closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove("active");
            document.getElementById("pdf-viewer").src = "";
            document.body.style.overflow = "auto";
        };
    }
    
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
            document.getElementById("pdf-viewer").src = "";
            document.body.style.overflow = "auto";
        }
    };
});
