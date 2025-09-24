<div class="banner__carousel owl-carousel">
    @foreach ($banner as $item)
        @if ($item->Active==1)
        <div class="item__banner">
            <a href="">
                <img class="" src="upload/banner/{{$item->Image}}" alt="">
            </a>
        </div>
        @endif
    @endforeach
</div>