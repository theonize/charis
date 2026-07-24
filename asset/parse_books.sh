awk -F, '{print >> $1/$3; close($1/$3);}' output
