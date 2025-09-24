<div class="container menu">
    <nav class="nav_menu col-hidden-md">
        <ul>
            <li><a href="">Trang chủ</a></li>
            <li><a href="">Giới thiệu</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/video">Video</a></li>
            <li><a href="">Liên hệ</a></li>
        </ul>
        <form action="/search" method="post">
            <input type="hidden" name="_token" value="{{csrf_token()}}">
            <?php
                if (Auth::check())
                {
                ?>
            <span class="btn">
                <a href="/trangcanhan" class="text-white"><i class="fas fa-user mr-2"> {{Auth::user()->name}}</i> </a>
            </span>
            <?php }
            else {
            ?>
             <span class="btn">
                <a href="/login" class="text-white"><i class="fas fa-user mr-2"></i> </a>
            </span>
            <?php } ?>
         
            <span class="btn display__form text-white"><i class="fas fa-search">
                    <div class="input__search">
                        <input type="text" name="KeyWord" placeholder="Tìm kiếm...">
                        <button class="btn" type="submit"><i class="fas fa-arrow-right"></i></button>
                    </div>
                </i>
            </span>

        </form>
    </nav>
</div>