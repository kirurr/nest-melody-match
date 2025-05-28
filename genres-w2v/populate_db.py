import json
import psycopg2
from psycopg2 import sql
from pgvector.psycopg2 import register_vector

DATABASE_URL = "postgresql://root:root@localhost:5432/nest_melody_match"  
JSON_FILE = 'vectors.json'
TABLE_NAME = 'Genre'
VECTOR_DIMENSION = 5  
BATCH_SIZE = 100


def insert_data(conn, table_name, data):
    cursor = conn.cursor()
    try:
        cursor.execute(sql.SQL("""
            INSERT INTO {} (name, vector)
            VALUES (%s, %s)
        """).format(sql.Identifier(table_name)), (data['name'], data['vector']))  
        conn.commit()
    except psycopg2.errors.UniqueViolation:  
        print(f"Entry with name '{data['name']}' already exists.")
    except Exception as e:
        print(f"Error occured during inserting data: {e}")


def insert_data_batch(conn, table_name, data_batch):
    cursor = conn.cursor()
    records = [(item['name'], item['vector']) for item in data_batch]  

    try:
		 
        records = [(item['name'], item['vector']) for item in data_batch]

        
        sql_insert = sql.SQL("INSERT INTO {} (name, vector) VALUES (%s, %s)").format(
            sql.Identifier(table_name)
        )
        cursor.executemany(sql_insert, records)
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        print("One or more entries already exist.")
    except Exception as e:
        print(f"Error with batch inserting data: {e}")


def main():
    conn = None

    try:
        conn = psycopg2.connect(DATABASE_URL)
        register_vector(conn)

        print(f"Успешное подключение к базе данных: {DATABASE_URL}")

        data_batch = []
        try:
            with open(JSON_FILE, 'r') as f:
                  data = json.load(f)  
        except json.JSONDecodeError as e:
            print(f"Ошибка при чтении JSON: {e}")
            return  

        for item in data:  
            for name, vector in item.items():
                data = {'name': name, 'vector': vector}
                data_batch.append(data)

            if len(data_batch) >= BATCH_SIZE:
                    insert_data_batch(conn, TABLE_NAME, data_batch)
                    data_batch = []


    except psycopg2.Error as e:
        print(f"DB connection error: {e}")

    finally:
        if conn:
            conn.close()
            print("Database connection closed.")


if __name__ == "__main__":
    main()
