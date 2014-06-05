require 'mongoid'

class User
  include Mongoid::Document

  has_and_belongs_to_many :spaces
  field :spaces, :type => Array, :default => []

  field :last_name, :type => String
  field :first_name, :type => String
  field :email, :type => String
  field :login_id, :type => String
  field :password_hash, :type => String
  field :password_salt, :type => String
  field :created_on, :type => Bignum
end
