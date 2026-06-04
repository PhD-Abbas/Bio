import os
import sys
import time
import subprocess

def get_pubs_state(directory):
    """Retrieve the state of the directory as a dictionary of filename -> modification time."""
    if not os.path.exists(directory):
        return {}
    
    state = {}
    try:
        for file in os.listdir(directory):
            if file.lower().endswith('.pdf'):
                path = os.path.join(directory, file)
                try:
                    state[file] = os.path.getmtime(path)
                except OSError:
                    # File might be in the middle of being written or deleted
                    pass
    except OSError as e:
        print(f"Error reading directory: {e}")
        
    return state

def run_git_commands():
    """Commit changes to git and push to GitHub."""
    print("\n--- Running Git Sync ---")
    try:
        # Check if the folder is inside a git repo
        git_check = subprocess.run(["git", "rev-parse", "--is-inside-work-tree"], capture_output=True, text=True)
        if git_check.returncode != 0:
            print("Error: This directory is not a Git repository. Please run 'git init' and configure a remote repository.")
            return

        # Git Status check
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if not status.stdout.strip():
            print("No changes to sync with Git.")
            return
            
        print("Changes detected. Staging files...")
        subprocess.run(["git", "add", "."], check=True)
        
        commit_msg = "Auto-update publications (detected change in pubs/)"
        print(f"Committing: '{commit_msg}'")
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        
        print("Pushing to GitHub...")
        subprocess.run(["git", "push"], check=True)
        print("Successfully pushed to GitHub Pages!")
        
    except subprocess.CalledProcessError as e:
        print(f"Git command failed: {e}")
    except FileNotFoundError:
        print("Error: 'git' command not found in the system path. Make sure Git is installed.")

def main():
    pubs_dir = "pubs"
    
    # Create the pubs directory if it doesn't exist
    if not os.path.exists(pubs_dir):
        os.makedirs(pubs_dir)
        print(f"Created '{pubs_dir}' directory.")
        
    # Generate XML initial run
    print("Initializing publications XML...")
    subprocess.run([sys.executable, "generate_xml.py"])
    
    print(f"\nWatching '{pubs_dir}' folder for changes...")
    print("Press Ctrl+C to stop the bot.")
    
    # Initial state
    last_state = get_pubs_state(pubs_dir)
    
    try:
        while True:
            time.sleep(2)  # Check every 2 seconds
            current_state = get_pubs_state(pubs_dir)
            
            # Compare states
            if current_state != last_state:
                print(f"\n[Change Detected at {time.strftime('%H:%M:%S')}]")
                
                # Identify added/removed/modified files
                added = [f for f in current_state if f not in last_state]
                removed = [f for f in last_state if f not in current_state]
                modified = [f for f in current_state if f in last_state and current_state[f] != last_state[f]]
                
                if added:
                    print(f" - Added: {', '.join(added)}")
                if removed:
                    print(f" - Removed: {', '.join(removed)}")
                if modified:
                    print(f" - Modified: {', '.join(modified)}")
                
                # Regenerate XML
                print("Regenerating publications.xml...")
                subprocess.run([sys.executable, "generate_xml.py"])
                
                # Sync with git
                run_git_commands()
                
                # Update last state
                last_state = current_state
                
    except KeyboardInterrupt:
        print("\nWatcher stopped. Goodbye!")

if __name__ == "__main__":
    main()
