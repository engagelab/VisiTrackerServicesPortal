require 'mongoid'

class Media
  include Mongoid::Document

  belongs_to :sessionob
  belongs_to :eventob

  field :uri, :type => String
  field :content_type, :type => String
  field :created_on, :type => Bignum

end
