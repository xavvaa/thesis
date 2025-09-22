from flask import Flask, request, jsonify
import spacy

nlp = spacy.load("resume_ner_model")

app = Flask(__name__)

@app.route("/parse-resume", methods=["POST"])
def parse_resume():
    data = request.json
    text = data.get("text", "")
    doc = nlp(text)
    entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    return jsonify({"entities": entities})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
