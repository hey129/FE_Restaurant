@extends('layout.index2')

@section('content')
<section class="content__news">
    <div class="list__items--contents">
        <?php
        function doimau($str,$tukhoa)
        {
          return  str_replace($tukhoa,"<span style='color:blue;'>$tukhoa</span>",$str);
        }
        ?>
        @foreach ($news as $item)
        <div class="item__news">
            <div class="image__news">
                <a href="/news/{{$item->id}}_{{$item->Sort_Title}}.html">
                    <img class="" src="upload/news/{{$item->Image}}" alt="">
                </a>
            </div>
            <div class="content__news">
                <a class="blog__title blog__title--hover" href="/news/{{$item->id}}_{{$item->Sort_Title}}.html">
                    {!!doimau($item->Title,$keyword) !!}
                </a>
                <p class="content__news--details">
                    {!!doimau($item->Summary,$keyword) !!}
                </p>
                <span class="news__time"> {{$item->created_at->format('d/m/Y H:i')}}</span>

            </div>
        </div>
        @endforeach
    </div>
    {{$news->links()}}
</section>
@endsection