import numpy as np
from collections import Counter
from pathlib import Path

def read_genres_from_file(filepath):

    filepath = Path(filepath)  
    try:
        genres = [line.strip() for line in filepath.read_text(encoding='utf-8').splitlines() if line.strip()]
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found.")
        return None

    return genres

def save_vectors_to_file(filepath, vectors):
	try:
		with open(filepath, 'w', encoding='utf-8') as f:
			f.write('[\n')
			for vector in vectors:
				f.write(vector + '\n')
			f.write('\n]')
	except Exception as e:
		print(f"Error occured during saving vectors to file: {e}")

def create_random_vector(dimension):
    return np.random.rand(dimension)

def weighted_word_embeddings(genres, vector_dimension=10):

    all_words = []
    for genre in genres:
        words = genre.split()
        all_words.extend(words)
    word_counts = Counter(all_words)

    word_vectors = {}
    for word in word_counts:
        word_vectors[word] = create_random_vector(vector_dimension)

    genre_vectors = {}
    for genre in genres:
        words = genre.split()
        genre_vector = np.zeros(vector_dimension)
        for word in words:
            genre_vector += word_vectors[word] * word_counts[word]  # Взвешиваем векторы слов
        genre_vectors[genre] = genre_vector

    return genre_vectors

if __name__ == "__main__":
	filepath = 'genres.txt'
	genres = read_genres_from_file(filepath)
	genre_vectors = weighted_word_embeddings(genres, vector_dimension=5)

	vectors = []
	for genre, vector in genre_vectors.items():
		vectors.append(f"{{\"{genre}\": {vector.tolist()}}},")

	save_vectors_to_file('vectors.json', vectors)