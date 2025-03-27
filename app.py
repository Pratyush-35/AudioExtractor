import os
import yt_dlp
from flask import Flask, render_template, request, jsonify, send_file

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/extract', methods=['POST'])
def extract_audio():
    data = request.json
    video_url = data.get("url")
    audio_format = data.get("format", "mp3")  # Default format is MP3

    if not video_url:
        return jsonify({"error": "Invalid URL"}), 400

    output_path = os.path.join(UPLOAD_FOLDER, "%(title)s.%(ext)s")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': audio_format,
            'preferredquality': '192',
        }],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            title = info.get("title", "unknown")
            duration = info.get("duration", 0)

        files = os.listdir(UPLOAD_FOLDER)
        latest_file = sorted(files, key=lambda x: os.path.getctime(os.path.join(UPLOAD_FOLDER, x)))[-1]
        file_path = os.path.join(UPLOAD_FOLDER, latest_file)
        file_size = round(os.path.getsize(file_path) / (1024 * 1024), 2)

        return jsonify({
            "message": "Audio extracted successfully!",
            "file": latest_file,
            "title": title,
            "duration": duration,
            "size": file_size,
            "format": audio_format
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)