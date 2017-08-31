from flask import Flask, render_template, request, session

app = Flask(__name__)

@app.route('/')
def switch() -> 'html':
	return render_template('Index.html')
	
app.run(debug=True)