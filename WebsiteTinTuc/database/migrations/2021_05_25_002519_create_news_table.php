<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateNewsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('News', function (Blueprint $table) {
            $table->increments('id');
            $table->string('Title');
            $table->string('Sort_Title');
            $table->string('Image');
            $table->integer('Type');
            $table->string('Link')->nullable();
            $table->text('Summary');
            $table->longText('Content');
            $table->integer('Index')->default(0);
            $table->integer('View')->default(0);
            $table->integer('idCategory')->unsigned();
            $table->foreign('idCategory')->references('id')->on('Category');
            $table->integer('idSubcategory')->unsigned();
            $table->foreign('idSubcategory')->references('id')->on('SubCategory');
            $table->integer('idUser')->unsigned();
            $table->foreign('idUser')->references('id')->on('users');
            $table->integer('Active')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('News');
    }
}
