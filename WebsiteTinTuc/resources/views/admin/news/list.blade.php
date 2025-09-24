@extends('admin.layout.index')
@section('content')
<div class="page-header card">
    <div class="row align-items-end">
        <div class="col-lg-8">
            <div class="page-header-title">
                <i class="feather icon-home bg-c-blue"></i>
                <div class="d-inline">
                    <h4>Tin tức</h4>
                    <span>danh sách</span>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="page-header-breadcrumb">
                <ul class=" breadcrumb breadcrumb-title">
                    <li class="breadcrumb-item">
                        <a href="index.html"><i class="feather icon-home"></i></a>
                    </li>
                    <li class="breadcrumb-item"><a href="#!">Tin tức</a> </li>
                </ul>
            </div>
        </div>
    </div>
</div>
<div class="main-body">
    <div class="page-wrapper">
        <div class="page-body">
            <div class="row">
                <div class="">
                    <div class="card" style="width:100%">           
                                <table class="table table-bordered ">
                                    <thead>
                                        <tr align="center">
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>SubCategory</th>
                    
                                            <th>Image</th>
                                            <th>Type</th>
                                            <th>Summary</th>
                                            <th>Index</th>
                                            <th>Active</th>
                                            <th>View</th>
                                            <th>Delete</th>
                                            <th>Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach ($news as $tt)
                                        <tr align="">
                                            <td>{{$tt->id}}</td>
                                            <td style="white-space:pre-wrap">{{$tt->Title}}</td>
                                            <td>{{$tt->subcategory->category->Name}}</td>
                                            <td>{{$tt->subcategory->Name}}</td>
                
                                            <td>
                                                <div  style="white-space:pre-wrap;text-align:left;text-align: center">{{$tt->TieuDe}}</div>
                                            <img width="100px" src="upload/news/{{$tt->Image}}" alt="">
                                            </td>
                                            <td>
                                                @if ($tt->Type==1)
                                                   {{"Text"}} 
                                                @else
                                                   {{"Video"}} 
                                                @endif
                                                </td>
                                                <td class="text-top" style="white-space:pre-wrap;text-align:left;">{{$tt->Summary}}  </td>

                                                <td>
                                                    @if ($tt->Index==1)
                                                       {{"Có"}} 
                                                    @else
                                                       {{"Không"}} 
                                                    @endif
                                                    </td>
                                                    <td>
                                                        @if ($tt->Active==1)
                                                        <a href="admin/news/block/{{$tt->id}}">
                                                          <img style="width: 40px" src="upload/icon/accept.png" alt="">
                                                        </a>
                                                        @else
                                                        <a href="admin/news/active/{{$tt->id}}">
                                                            <img style="width: 40px" src="upload/icon/noaccept.png" alt="">
                                                        </a>
                                                        @endif
                                                    </td>
                                                    <td>{{$tt->View}}</td>
                                            <td  class="center"><a class="btn btn-danger " href="admin/news/delete/{{$tt->id}}"> Delete</a></td>
                                            <td class="center"><a class="btn btn-warning " href="admin/news/edit/{{$tt->id}}">Edit</a></td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection