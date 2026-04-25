import wikipediaapi
from fastapi import FastAPI

app = FastAPI();
@app.get("/message")
def message():
    return {"text" : "Hello From Python"}
    

# Initialize with a descriptive user agent and language
wiki = wikipediaapi.Wikipedia(
    user_agent='MyWebProject (example@email.com)',
    language='en',
    extract_format=wikipediaapi.ExtractFormat.HTML
)

page = wiki.page('Python_(programming_language)')

if page.exists():
    # Get the HTML content to insert directly into your webpage
    html_content = page.text
    print(html_content)

