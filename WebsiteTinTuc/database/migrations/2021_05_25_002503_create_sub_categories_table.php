<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSubCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('SubCategory', function (Blueprint $table) {
            $table->increments('id');
            $table->string('Name');
            $table->string('Sort_Name');

            $table->integer('idCategory')->unsigned();
            $table->foreign('idCategory')->references('id')->on('Category');
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
        Schema::dropIfExists('sub_categories');
    }
}
