docker run -d --name mariadb -p 3307:3306 -e MARIADB_ROOT_PASSWORD=toor -e MARIADB_DATABASE=minddb -e MARIADB_USER=mindadmin -e MARIADB_PASSWORD=nimdadnim -v mariadb_data:/var/lib/mysql mariadb:11
