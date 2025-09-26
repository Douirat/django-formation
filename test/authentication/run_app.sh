python manage.py makemigrations # used to create migrations files, that mean changes in models.
# it is not needed to run it every time, only when models.py file is changed.
# what it does under the hood literallyis create database migration files. so every model have a recurcession in migrations folder and that migration file will be
#  a create tabel.. delete table which will turn later on into a table in data base with real data in it. 
python manage.py migrate  # it applies the migration files to the database, so it creates the tables in the database.

python manage.py runserver  # it runs the server on localhost:8000 by default.

# to test the server run the test/customer_register.sh file in another terminal.
# to stop the server press ctrl+c in the terminal where the server is running.
# to change the port run python manage.py runserver 8080 (or any port you want)
