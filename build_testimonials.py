import urllib.request
import json
import re
import os
import sys

def fetch_comments():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("No GITHUB_TOKEN provided, skipping testimonials")
        return []

    url = "https://api.github.com/graphql"
    query = """
    query {
      repository(owner: "sloev", name: "robo") {
        discussion(number: 2) {
          comments(last: 10) {
            nodes {
              author { login }
              body
              url
            }
          }
        }
      }
    }
    """
    
    req = urllib.request.Request(url, json.dumps({"query": query}).encode("utf-8"))
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        return data["data"]["repository"]["discussion"]["comments"]["nodes"]
    except Exception as e:
        print(f"Error fetching comments: {e}")
        return []

def extract_image(body):
    # Try markdown
    md_match = re.search(r'!\[.*?\]\((.*?)\)', body)
    if md_match: return md_match.group(1), re.sub(r'!\[.*?\]\(.*?\)', '', body).strip()
    
    # Try HTML
    html_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', body)
    if html_match: return html_match.group(1), re.sub(r'<img[^>]+>', '', body).strip()
    
    return None, body

def main():
    comments = fetch_comments()
    slides = []
    dots = []
    
    for i, c in enumerate(reversed(comments)):
        if not c: continue
        author = c["author"]["login"] if c.get("author") else "Anonymous"
        avatar_letter = author[0].upper() if author else "A"
        url = c["url"]
        body = c["body"]
        
        img_url, text = extract_image(body)
        if not img_url:
            continue # Only feature comments with images
            
        # Truncate text
        text = text.replace('\r', '').replace('\n', ' ')
        if len(text) > 300: text = text[:297] + "..."
        if not text: text = "Check out this amazing build!"
        
        active_class = "active" if len(slides) == 0 else ""
        
        slide_html = f"""
        <div class="carousel-slide {active_class}">
          <div class="testimonial-card">
            <img src="{img_url}" alt="Build by {author}" class="testimonial-img">
            <div class="testimonial-content">
              <blockquote class="testimonial-quote">"{text}"</blockquote>
              <div class="testimonial-author">
                <div class="testimonial-author-avatar">{avatar_letter}</div>
                <div>
                  <div style="font-weight: 600; color: var(--text);">@{author}</div>
                  <div style="color: var(--muted); font-size: 0.85rem;">GitHub Community</div>
                </div>
              </div>
              <a href="{url}" target="_blank" class="testimonial-link">Read original post ↗</a>
            </div>
          </div>
        </div>
        """
        slides.append(slide_html)
        dots.append(f'<div class="carousel-dot {active_class}" data-index="{len(slides)-1}"></div>')

    # Add fallback placeholder if no valid comments found
    if not slides:
        print("No valid comments with images found. Keeping placeholder.")
        return

    # Add the "You're Next" slide
    slides.append(f"""
        <div class="carousel-slide">
          <div class="testimonial-card">
            <div class="testimonial-img" style="background: var(--surface-light); display: flex; align-items: center; justify-content: center; font-size: 4rem;">🛠️</div>
            <div class="testimonial-content">
              <blockquote class="testimonial-quote">"Your creation could be featured here! Share your ESP32 robot, crane, or catapult in our GitHub Discussions."</blockquote>
              <div class="testimonial-author">
                <div class="testimonial-author-avatar" style="background: var(--success);">Y</div>
                <div>
                  <div style="font-weight: 600; color: var(--text);">You</div>
                  <div style="color: var(--muted); font-size: 0.85rem;">Next Builder</div>
                </div>
              </div>
              <a href="https://github.com/sloev/robo/discussions/2" target="_blank" class="testimonial-link">Post your build ↗</a>
            </div>
          </div>
        </div>
    """)
    dots.append(f'<div class="carousel-dot" data-index="{len(slides)-1}"></div>')

    # Read public/index.html
    html_path = "public/index.html"
    try:
        with open(html_path, "r") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading index.html: {e}")
        return

    # Replace slides
    track_pattern = re.compile(r'(<div class="carousel-track" id="testimonial-track">).*?(</div>\s*<div class="carousel-nav")', re.DOTALL)
    new_track = r'\1' + "\n" + "".join(slides) + "\n" + r'\2'
    content = track_pattern.sub(new_track, content)

    # Replace dots
    nav_pattern = re.compile(r'(<div class="carousel-nav" id="carousel-nav">).*?(</div>\s*</div>\s*</div>\s*<h2 class="section-title">)', re.DOTALL)
    new_nav = r'\1' + "\n" + "".join(dots) + "\n" + r'\2'
    content = nav_pattern.sub(new_nav, content)

    with open(html_path, "w") as f:
        f.write(content)
    print("Successfully updated testimonials in index.html!")

if __name__ == "__main__":
    main()
