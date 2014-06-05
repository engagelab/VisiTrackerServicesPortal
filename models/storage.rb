require 'mongoid'

class Storage
  include Mongoid::Document

  belongs_to :sessionob

  field :name, :type => String
  field :url, :type => String
  field :s3id, :type => String
end
