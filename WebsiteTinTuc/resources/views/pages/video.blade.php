@extends('layout.index2')

@section('content')
<section class="content__news">
    <div class="list__items--contents">
       
        @foreach ($news as $item)
        <div class="item__news">
            <div class="image__news">
                <a href="/news/{{$item->id}}_{{$item->Sort_Title}}.html">
                    <img class="" src="upload/news/{{$item->Image}}" alt="">
                </a>
            </div>
            <div class="content__news">
                <a class="blog__title blog__title--hover" href="/news/{{$item->id}}_{{$item->Sort_Title}}.html">
                    {{$item->Title}}
                </a>
                <p class="content__news--details">
                    {{$item->Summary}}
                </p>
                <span class="news__time"> {{$item->created_at->format('d/m/Y H:i')}}</span>


            </div>
        </div>
        @endforeach
        {{-- <div class="item__news">
            <div class="image__news">
                <a href="">
                    <img class="" src="img/news.jpg" alt="">
                </a>
            </div>
            <div class="content__news">
                <a class="blog__title blog__title--hover" href="">Hội thảo
                    Uni
                    of
                    Western Australia: du học, học bổng, định cư 2019
                </a>
                <p class="content__news--details">Hội thảo cập nhật
                    thông tin toàn
                    diện về UWA, chương trình học
                    bổng tới 10.000 AUD một năm, chia sẻ kinh nghiệm từ cựu du học sinh của
                    trường.
                </p>
                <span class="news__time">17/01/2019</span>

            </div>
        </div>
        <div class="item__news">
            <div class="image__news">
                <a href="">
                    <img class="" src="img/news.jpg" alt="">
                </a>
            </div>
            <div class="content__news">
                <a class="blog__title blog__title--hover" href="">Hội thảo
                    Uni
                    of
                    Western Australia: du học, học bổng, định cư 2019
                </a>
                <p class="content__news--details">Hội thảo cập nhật
                    thông tin toàn
                    diện về UWA, chương trình học
                    bổng tới 10.000 AUD một năm, chia sẻ kinh nghiệm từ cựu du học sinh của
                    trường.
                </p>
                <span class="news__time">17/01/2019</span>

            </div>
        </div>
        <div class="item__news">
            <div class="image__news">
                <a href="">
                    <img class="" src="img/news.jpg" alt="">
                </a>
            </div>
            <div class="content__news">
                <a class="blog__title blog__title--hover" href="">Hội thảo
                    Uni
                    of
                    Western Australia: du học, học bổng, định cư 2019
                </a>
                <p class="content__news--details">Hội thảo cập nhật
                    thông tin toàn
                    diện về UWA, chương trình học
                    bổng tới 10.000 AUD một năm, chia sẻ kinh nghiệm từ cựu du học sinh của
                    trường.
                </p>
                <span class="news__time">17/01/2019</span>

            </div>
        </div>
        <div class="item__news">
            <div class="image__news">
                <a href="">
                    <img class="" src="img/news.jpg" alt="">
                </a>
            </div>
            <div class="content__news">
                <a class="blog__title blog__title--hover" href="">Hội thảo
                    Uni
                    of
                    Western Australia: du học, học bổng, định cư 2019
                </a>
                <p class="content__news--details">Hội thảo cập nhật
                    thông tin toàn
                    diện về UWA, chương trình học
                    bổng tới 10.000 AUD một năm, chia sẻ kinh nghiệm từ cựu du học sinh của
                    trường.
                </p>
                <span class="news__time">17/01/2019</span>

            </div>
        </div>
        <div class="item__news">
            <div class="image__news">
                <a href="">
                    <img class="" src="img/news.jpg" alt="">
                </a>
            </div>
            <div class="content__news">
                <a class="blog__title blog__title--hover" href="">Hội thảo
                    Uni
                    of
                    Western Australia: du học, học bổng, định cư 2019
                </a>
                <p class="content__news--details">Hội thảo cập nhật
                    thông tin toàn
                    diện về UWA, chương trình học
                    bổng tới 10.000 AUD một năm, chia sẻ kinh nghiệm từ cựu du học sinh của
                    trường.
                </p>
                <span class="news__time">17/01/2019</span>

            </div>
        </div> --}}
    </div>
    {{$news->links()}}
</section>
@endsection