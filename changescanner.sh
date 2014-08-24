python /Users/kevinoverall/Sites/champ-builder-js/changescanner.py > /Users/kevinoverall/Sites/champ-builder-js/newdata.txt
date >> /Users/kevinoverall/Sites/champ-builder-js/changelog.txt
diff /Users/kevinoverall/Sites/champ-builder-js/olddata.txt /Users/kevinoverall/Sites/champ-builder-js/newdata.txt >> /Users/kevinoverall/Sites/champ-builder-js/changelog.txt
echo ============================================================ >> /Users/kevinoverall/Sites/champ-builder-js/changelog.txt
cp /Users/kevinoverall/Sites/champ-builder-js/newdata.txt /Users/kevinoverall/Sites/champ-builder-js/olddata.txt
