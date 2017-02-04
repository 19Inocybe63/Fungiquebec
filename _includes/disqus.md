{% if site.disqus and page.comments %}
<div class="row">
    <div class="col-lg-12">
        <h4>Commentaires</h4>
        <div class="hline"></div>
        <div class="spacing"></div>

        <div id="disqus_thread"></div>
        <script>
            var disqus_config = function () {
                this.page.url = "{{ page.url | prepend: site.baseurl | prepend: site.url }}";
                this.page.identifier = "{{ page.title }}";
            };
            (function() {
                var d = document, s = d.createElement('script');
                s.src = '//{{ site.disqus }}.disqus.com/embed.js';
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
            })();
        </script>
        <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>

        <div class="spacing"></div>
    </div>
</div><!--/row -->
{% endif %}