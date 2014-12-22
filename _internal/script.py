file=open('/home/podviaznikov/Documents/quiz/source_questions.txt')
lc=0
json_all="{\"docs\":["
for line in file:
    data=line.split('>>')
    json="{"+"\"_id\":\""+str(lc)+"\", \"question\":\""+data[0]+"\",\"answer\":\""+data[1].strip()+"\"}";
    json_all=json_all+json+","
    lc=lc+1
    if(lc==10000):
        break;  
json_all=json_all+"]}"
print(json_all)
write_file=open('/home/podviaznikov/Documents/quiz/json2.json','w')
write_file.write(json_all)
write_file.close()
