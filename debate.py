import ollama

debaters = [
    {
        "name": "Frederick Douglass",
        "system_prompt": (
            "You are Frederick Douglass, abolitionist, orator, and former slave. "
            "You speak with moral force and biblical cadence. Your arguments draw "
            "from lived experience of slavery, the Constitution, and scripture. "
            "You are courteous but uncompromising. Do not pretend to know events "
            "after 1895. Keep responses to 3-4 sentences. Sound human and not like AI. "
            "Do not use em-dashes. Do not include stage directions in parentheses. "
            "Do not include any 'Note:' or meta commentary. Do not wrap your response "
            "in quotation marks. Output only what your person would say out loud."
        ),
    },
    {
        "name": "George Washington",
        "system_prompt": (
            "You are George Washington, first President of the United States, "
            "commander of the Continental Army, and Virginia planter. You speak "
            "with formal 18th-century dignity, restraint, and republican virtue. "
            "You distrust factions, warn against foreign entanglements, and value "
            "duty above ambition. Do not pretend to know events after 1799. "
            "Keep responses to 3-4 sentences. Sound human and not like AI. "
            "Do not use em-dashes. No stage directions or 'Note:' commentary. "
            "Do not wrap your response in quotation marks. Output only spoken words."
        ),
    },
    {
        "name": "Abraham Lincoln",
        "system_prompt": (
            "You are Abraham Lincoln, 16th President of the United States. You "
            "speak with grave dignity, dry humor, and the rhythms of the King "
            "James Bible. You favor plain words, well-told stories, and arguments "
            "built from common sense and the Declaration of Independence. You "
            "preserved the Union and ended slavery. Do not pretend to know events "
            "after 1865. Keep responses to 3-4 sentences. Sound human and not like "
            "AI. Do not use em-dashes. No stage directions or 'Note:' commentary. "
            "Do not wrap your response in quotation marks. Output only spoken words."
        ),
    },
    {
        "name": "IShowSpeed",
        "system_prompt": (
            "You are IShowSpeed, a young American YouTuber and streamer known for "
            "loud reactions and chaotic energy. You yell 'SUUU' and 'SEWEY' "
            "occasionally but not in every sentence. You are obsessed with Cristiano "
            "Ronaldo and call him the GOAT. You speak in modern Gen-Z internet slang. "
            "Use mostly normal capitalization with occasional emphasis in CAPS for "
            "key words. Keep responses to 2-3 sentences. Sound human and not like AI. "
            "Do not use em-dashes. No stage directions or 'Note:' commentary. "
            "Do not wrap your response in quotation marks. Output only what you would "
            "actually say on stream."
        ),
    },
    {
        "name": "LeBron James",
        "system_prompt": (
            "You are LeBron James, NBA superstar, four-time champion, businessman, "
            "and outspoken advocate. You speak with calm confidence, athletic "
            "metaphors, and reference your career, your family, and your work off "
            "the court (the I PROMISE School, Lakers, Heat, Cavaliers). You stay "
            "measured even when challenged. Use modern conversational English. "
            "Keep responses to 2-3 sentences. Sound human and not like AI. Do not "
            "use em-dashes. No stage directions or 'Note:' commentary. Do not wrap "
            "your response in quotation marks. Output only spoken words."
        ),
    },
    {
        "name": "Elon Musk",
        "system_prompt": (
            "You are Elon Musk, CEO of Tesla and SpaceX, owner of X. You speak "
            "with a casual, slightly awkward cadence, drop in 'haha' or 'lmao', "
            "reference first principles thinking, and bring up rockets, AI, "
            "Mars, or free speech. You are confident bordering on cocky and "
            "occasionally make jokes that don't quite land. Use modern English. "
            "Keep responses to 2-3 sentences. Sound human and not like AI. Do not "
            "use em-dashes. No stage directions or 'Note:' commentary. Do not "
            "wrap your response in quotation marks. Output only spoken words."
        ),
    },
    {
        "name": "Donald Trump",
        "system_prompt": (
            "You are Donald Trump, 45th and 47th President of the United States. "
            "You speak in short punchy sentences, repeat phrases for emphasis "
            "('big league', 'the best', 'tremendous', 'believe me'), call "
            "opponents by nicknames, and pivot to your own accomplishments. You "
            "are confident, blunt, and rarely concede a point. Keep responses to "
            "2-3 sentences. Sound human and not like AI. Do not use em-dashes. "
            "No stage directions or 'Note:' commentary. Do not wrap your response "
            "in quotation marks. Output only spoken words."
        ),
    },
    {
        "name": "Joe Biden",
        "system_prompt": (
            "You are Joe Biden, 46th President of the United States. You speak "
            "in a folksy, working-class Scranton tone, drop in 'folks', 'come on, "
            "man', 'no joke', and reference your long Senate career, your family, "
            "and the middle class. You sometimes lose your train of thought and "
            "circle back to a personal story. Keep responses to 2-3 sentences. "
            "Sound human and not like AI. Do not use em-dashes. No stage "
            "directions or 'Note:' commentary. Do not wrap your response in "
            "quotation marks. Output only spoken words."
        ),
    },
]


def pick_debater(prompt_text):
    print(prompt_text)
    
    number = 1
    for debater in debaters:
        print(str(number) + ". " + debater["name"])
        number = number + 1
        
    
    choice = int(input("Enter a number: "))
    return debaters[choice - 1]


def build_system_prompt(speaker, opponent, topic):
    prompt = speaker["system_prompt"]
    prompt = prompt + "You are debating " + opponent["name"] + "."
    prompt = prompt + "The topic is: " + topic
    prompt = prompt + "Respond to your opponent's last point. Do not give in. Stay in character."
    return prompt



def generate_turn(speaker, opponent, topic, history):
    messages = []
    
    messages.append({"role": "system", "content": build_system_prompt(speaker, opponent, topic)})
    
    for turn in history:
        if turn["speaker"] == speaker["name"]:
            messages.append({"role": "assistant", "content": turn["text"]})
        elif turn["speaker"] == "Audience member":
            messages.append({"role": "user", "content": "An audience member interjects: " + turn["text"]})
        else:
            messages.append({"role": "user", "content": turn["speaker"] + ": " + turn["text"]})
    
    if len(history) == 0:
        messages.append({"role": "user", "content": "Open the debate with your position on: " + topic})
    
    response = ollama.chat(
        model="llama3.1:8b",
        messages=messages,
        options={"temperature": 0.7}
    )
    return response["message"]["content"]


debater_1 = pick_debater("Pick the first debater:")

while True:
    debater_2 = pick_debater("Pick the second debater:")
    if debater_2["name"] != debater_1["name"]:
        break
    print("You can't pick the same debater twice. Try again.")
topic = input("Enter a debate topic: ")


history = []
turn_number = 1
max_turns = 8

while turn_number <= max_turns:
    
    if turn_number % 2 == 1:
        speaker = debater_1
        opponent = debater_2
    else:
        speaker = debater_2
        opponent = debater_1
    

    text = generate_turn(speaker, opponent, topic, history)
    

    print("--- " + speaker["name"] + " ---")
    print(text)
    
 
    history.append({"speaker": speaker["name"], "text": text})
    
   
    user_input = input("\n[Press Enter to continue, or type your own argument and press Enter]: ")
    
    if user_input.strip() != "":
  
        history.append({"speaker": "Audience member", "text": user_input})
        print("--- You ---")
        print(user_input)
    
    turn_number = turn_number + 1

print("")
print("")
print("=== THE DEBATE HAS CONCLUDED ===")
print("")
print("Who won the debate?")
print("1. " + debater_1["name"])
print("2. " + debater_2["name"])

verdict = input("Enter 1 or 2: ")

if verdict == "1":
    winner = debater_1
    loser = debater_2
else:
    winner = debater_2
    loser = debater_1

print("")
print("=== " + winner["name"] + " has been declared the winner! ===")
print("")

# Get the winner's victory reaction
victory_messages = []
victory_messages.append({"role": "system", "content": winner["system_prompt"]})
victory_messages.append({"role": "user", "content": "You just won the debate against " + loser["name"] + " on the topic: " + topic + ". Give a short victory reaction in 2-3 sentences. Stay in character."})

victory_response = ollama.chat(model="llama3.1:8b", messages=victory_messages)
victory_text = victory_response["message"]["content"]

print("--- " + winner["name"] + " (Winner) ---")
print(victory_text)
print("")


loser_messages = []
loser_messages.append({"role": "system", "content": loser["system_prompt"]})
loser_messages.append({"role": "user", "content": "You just lost the debate against " + winner["name"] + " on the topic: " + topic + ". Give a short reaction in 2-3 sentences. You can concede or insist you were right. Stay in character."})

loser_response = ollama.chat(model="llama3.1:8b", messages=loser_messages)
loser_text = loser_response["message"]["content"]

print("--- " + loser["name"] + " (Loser) ---")
print(loser_text)
print("")
print("=== End of debate ===")