@extends('layout.index2')
@section('content')
<section class="section__content__news">
            <section class="details__news">
                <a href="" class="title__details blog__title blog__title--hover">
                    {{$news->Title}}
                </a>
                <div class="details__news--time">
                    <div class="news__time--left">
                        <i class="fas fa-calendar-alt"></i>
                        <span>{{$news->created_at->format('d/m/Y H:i')}}</span>
                    </div>
                    <div class="news__time--right">
                        <i class="fas fa-user"></i>
                        <span>Đăng bởi Admin</span>
                    </div>
                </div>
                <div class="details__news--content">
                    <div class="news__content--sort">
                        {{$news->Summary}}
                    </div>
                    <div class="news__content--img" style="text-align: center;">
                        @if ($news->Type == 0)
                            @if ($news->Link!="")
                            {{-- <iframe width="560" height="315" src="https://www.youtube.com/embed/psZ1g9fMfeo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> --}}
                            <iframe width="840" height="472" src="{{$news->Link}}"
                                title="YouTube video player" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen></iframe>
                            @else
                            <img class="w-100" src="upload/news/{{$news->Image}}" alt=""> 
                                
                            @endif
                            
                        @else
                            <img class="w-100" src="upload/news/{{$news->Image}}" alt=""> 
                        @endif
                      
                    </div>
                    <div class="news__content--contents">
                        {!!$news->Content!!}
                    </div>
                </div>
                <div class="social__network">

                </div>
                <div class="same__topic">
                    <div class="same__title">
                        Bài Viết Cùng chủ đề
                    </div>
                    <ul>
                        @foreach ($tinlienquan as $item)
                        <li><a class="blog__title blog__title--hover" href="">{{$item->Title}}</a></li>
                        @endforeach
                       
                        {{-- <li><a class="blog__title blog__title--hover" href="">Học bổng toàn phần Trung học
                                Công lập Mỹ 2019</a></li>
                        <li><a class="blog__title blog__title--hover" href="">Học bổng toàn phần Trung học
                                Công lập Mỹ 2019</a></li>
                        <li><a class="blog__title blog__title--hover" href="">Học bổng toàn phần Trung học
                                Công lập Mỹ 2019</a></li> --}}

                    </ul>
                </div>
                <div class="box__comment">
                    <div class="box__comment--title">Bình luận</div>
                    <div class="list__comment">
                        @foreach ($news->Comment as $item)
                        <div class="comment__item">
                            <div class="item__cmt--img">
                                <img src="upload/avatar/{{$item->users->Image}}" alt="">
                            </div>
                            <div class="item__cmt--content">
                                <div class="comment__author">{{$item->users->name}}</div>
                                <div class="comment__time">{{$item->created_at->format('d/m/Y H:i')}}</div>
                                <div class="comment__contents">{{$item->Content}}</div>
                            </div>
                        </div>
                        @endforeach
                        
                        {{-- <div class="comment__item">
                            <div class="item__cmt--img">
                                <img src="img/avt" alt="">
                            </div>
                            <div class="item__cmt--content">
                                <div class="comment__author">Bình</div>
                                <div class="comment__time">22/05/2021</div>
                                <div class="comment__contents">Bình</div>
                            </div>
                        </div> --}}
                    </div>
                </div>
                <div class="form__comment">
                    @if (Auth::check())
                    <div class="form__comment--title">
                        Ý kiến của bạn
                    </div>
                    <form action="comment/{{$news->id}}" method="POST">
                        <input type="hidden" name="_token" value="{{csrf_token()}}" />
                        <div class="form--comment">
                          <textarea name="comment" id="" cols="30" rows="10"></textarea>
                           <button class="contract__input contract__button--search">Gửi bình luận</button>
                        </div>
                        
                    </form>
                    @else
                    <div class="form__comment--title">
                        Vui lòng <a style="font-size: 1.5rem" href="/login">đăng nhập</a>  để bình luận
                    </div>
                    @endif
                   
                   
                </div>
            </section>
</section>

@endsection
@section('script')
    <script>    
        $(document).ready(function(){
        $('.fix__content').removeClass('content__news--flex');
        });
    </script>
@endsection