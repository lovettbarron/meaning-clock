javascript: q = location.href;
if (document.getSelection) {
    d = document.getSelection();
} else {
    d = '';
};
p = document.title;
void(open('http://readywater.ca/1thingtag'
encodeURIComponent(q)'&description='
encodeURIComponent(d)'&title='
encodeURIComponent(p), 'Pinboard', 'toolbar=no,width=700,height=600'));