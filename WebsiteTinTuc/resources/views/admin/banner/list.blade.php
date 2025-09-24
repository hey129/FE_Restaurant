@extends('admin.layout.index')
@section('content')
<div class="page-header card">
    <div class="row align-items-end">
        <div class="col-lg-8">
            <div class="page-header-title">
                <i class="feather icon-home bg-c-blue"></i>
                <div class="d-inline">
                    <h4>Banner</h4>
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
                    <li class="breadcrumb-item"><a href="#!">Banner</a> </li>
                </ul>
            </div>
        </div>
    </div>
</div>
<div class="main-body">
    <div class="page-wrapper">

        <div class="page-body">
            <div class="row">
                <div class="col-sm-12">
                    <div class="card" style="width:100%">

                        <div class="">
                            <div class="">
                                <table style="width:100%" class="table table-striped table-bordered ">
                                    <thead>
                                        <tr align="center">
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Image</th>
                                            <th>Content</th>
                                            <th>Link</th>
                                            <th>Active</th>
                                            <th>Delete</th>
                                            <th>Edit</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach ($banner as $tt)
                                        <tr align="center">
                                            <td>{{$tt->id}}</td>
                                            <td>{{$tt->Name}}</td>
                                            <td>
                                                <div  style="white-space:pre-wrap;text-align:left;text-align: center"></div>
                                            <img width="100px" src="upload/banner/{{$tt->Image}}" alt="">
                                            </td>
                                            <td>{{$tt->Content}}</td>
                                            <td>{{$tt->Link}}</td>

                                            <td>
                                                @if ($tt->Active==1)
                                                <a href="admin/banner/block/{{$tt->id}}">
                                                  <img style="width: 40px" src="upload/icon/accept.png" alt="">
                                                </a>
                                                @else
                                                <a href="admin/banner/active/{{$tt->id}}">
                                                    <img style="width: 40px" src="upload/icon/noaccept.png" alt="">
                                                </a>
                                                @endif
                                            </td>
                                            <td  class="center"><a class="btn btn-danger " href="admin/banner/delete/{{$tt->id}}"> Delete</a></td>
                                            <td class="center"><a class="btn btn-warning " href="admin/banner/edit/{{$tt->id}}">Edit</a></td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                                {{-- {!!$tintuc->links()!!} --}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection