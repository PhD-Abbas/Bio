import os
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime

def format_size(bytes_size):
    """Format file size in KB or MB."""
    if bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.1f} KB"
    return f"{bytes_size / (1024 * 1024):.1f} MB"

def get_clean_title(filename):
    """Generate a clean title from the filename (e.g. anatomy_paper.pdf -> Anatomy Paper)."""
    # Remove extension
    name_without_ext = os.path.splitext(filename)[0]
    # Replace underscores, hyphens, and dots with spaces
    clean_name = name_without_ext.replace('_', ' ').replace('-', ' ').replace('.', ' ')
    # Capitalize words
    return clean_name.strip()

def generate_publications_xml():
    pubs_dir = "pubs"
    xml_filename = "publications.xml"
    
    # Create pubs directory if it does not exist
    if not os.path.exists(pubs_dir):
        os.makedirs(pubs_dir)
        print(f"Created directory: {pubs_dir}")
        
    # Root element
    root = ET.Element("publications")
    
    # Scan pubs directory
    pdf_files = []
    if os.path.exists(pubs_dir):
        for file in os.listdir(pubs_dir):
            if file.lower().endswith('.pdf'):
                pdf_files.append(file)
                
    # Sort files alphabetically or by date
    # Let's sort alphabetically for now, but we can also get modified time
    pdf_files.sort()
    
    for file in pdf_files:
        filepath = os.path.join(pubs_dir, file)
        stat_info = os.stat(filepath)
        file_size = format_size(stat_info.st_size)
        
        # Format modification date (e.g., YYYY-MM-DD)
        mod_date = datetime.fromtimestamp(stat_info.st_mtime).strftime('%Y-%m-%d')
        
        pub = ET.SubElement(root, "publication")
        
        filename_elem = ET.SubElement(pub, "filename")
        filename_elem.text = file
        
        title_elem = ET.SubElement(pub, "title")
        title_elem.text = get_clean_title(file)
        
        size_elem = ET.SubElement(pub, "size")
        size_elem.text = file_size
        
        date_elem = ET.SubElement(pub, "date")
        date_elem.text = mod_date
        
    # Convert to pretty XML string
    rough_string = ET.tostring(root, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    pretty_xml = reparsed.toprettyxml(indent="  ", encoding="utf-8").decode('utf-8')
    
    # Write to file
    with open(xml_filename, "w", encoding="utf-8") as f:
        f.write(pretty_xml)
        
    print(f"Successfully generated {xml_filename} with {len(pdf_files)} publications.")

if __name__ == "__main__":
    generate_publications_xml()
